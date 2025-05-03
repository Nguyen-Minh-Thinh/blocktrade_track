from flask import Blueprint, jsonify, request
from flask_cors import CORS
import logging
import asyncio
import redis
import json
import requests
import os
from dotenv import load_dotenv
from binance.client import Client
from .clickhouse_config import execute_clickhouse_query, DATABASE
import aiohttp
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Initialize the Blueprint for chatbot routes
chatbot_bp = Blueprint('chatbot', __name__)
CORS(chatbot_bp, supports_credentials=True, origins="*")

# Set up logging
logger = logging.getLogger(__name__)

# Binance client (no API key needed for public endpoints)
binance_client = Client()

# Redis connection for caching and price alerts
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    redis_client.ping()
    logger.info("Connected to Redis successfully")
except redis.RedisError as e:
    logger.warning(f"Failed to connect to Redis: {str(e)}. Proceeding without caching.")
    redis_client = None

CACHE_TTL = 300  # Cache for 5 minutes
TIMEOUT = 10  # Timeout for Binance requests

# Gemini API configuration
GEMINI_API_KEY = "AIzaSyDbBvae4QrhfNLUrjjK5edYKQtwf_0ghxw"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

# Global variables to store preloaded database data
COINS_DATA = {}  # Lưu thông tin coin: {symbol: coin_id}
NEWS_DATA = {}   # Lưu tin tức: {coin_id: [news_items]}
PORTFOLIO_DATA = {}  # Lưu danh mục đầu tư: {user_id: [portfolio_items]}

# Function to preload data from ClickHouse database
def preload_database():
    global COINS_DATA, NEWS_DATA, PORTFOLIO_DATA
    logger.info("Preloading data from ClickHouse database...")

    # 1. Load coins data
    try:
        query = """
        SELECT symbol, coin_id
        FROM {db}.coins
        """.format(db=DATABASE)
        result = execute_clickhouse_query(query)
        data = result.get('data', [])
        for row in data:
            COINS_DATA[row['symbol'].lower()] = row['coin_id']
        logger.info(f"Loaded {len(COINS_DATA)} coins from database.")
    except Exception as e:
        logger.error(f"Error loading coins data: {str(e)}")
        COINS_DATA = {symbol.lower(): symbol.lower() for symbol in ['btc', 'eth', 'bnb', 'ada', 'xrp']}

    # 2. Load news data
    try:
        query = """
        SELECT coin_id, title, news_link, source_name, updated_at
        FROM {db}.news
        ORDER BY updated_at DESC
        """.format(db=DATABASE)
        result = execute_clickhouse_query(query)
        data = result.get('data', [])
        for row in data:
            coin_id = row['coin_id']
            if coin_id not in NEWS_DATA:
                NEWS_DATA[coin_id] = []
            NEWS_DATA[coin_id].append({
                'title': row['title'],
                'news_link': row['news_link'],
                'source_name': row['source_name'],
                'updated_at': row['updated_at']
            })
        logger.info(f"Loaded news for {len(NEWS_DATA)} coins from database.")
    except Exception as e:
        logger.error(f"Error loading news data: {str(e)}")
        NEWS_DATA = {}

    # 3. Load portfolio data
    try:
        query = """
        SELECT user_id, coin_id, amount, purchase_price, c.symbol
        FROM {db}.portfolio p
        JOIN {db}.coins c ON p.coin_id = c.coin_id
        """.format(db=DATABASE)
        result = execute_clickhouse_query(query)
        data = result.get('data', [])
        for row in data:
            user_id = row['user_id']
            if user_id not in PORTFOLIO_DATA:
                PORTFOLIO_DATA[user_id] = []
            PORTFOLIO_DATA[user_id].append({
                'coin_id': row['coin_id'],
                'amount': row['amount'],
                'purchase_price': row['purchase_price'],
                'symbol': row['symbol']
            })
        logger.info(f"Loaded portfolio data for {len(PORTFOLIO_DATA)} users from database.")
    except Exception as e:
        logger.error(f"Error loading portfolio data: {str(e)}")
        PORTFOLIO_DATA = {}

# Preload database when the module is loaded
preload_database()

# Helper function to fetch real-time data from Binance
async def fetch_binance_data(symbol):
    binance_symbol = symbol.upper()
    if binance_symbol.endswith("USDT"):
        binance_symbol = binance_symbol[:-4]

    binance_symbol = f"{binance_symbol}USDT"
    binance_data = {
        'price': None,
        'price_change_24h': None,
        'volume_24h': None,
        'price_change_1h': None,
        'price_change_7d': None
    }

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(
                f"https://api.binance.com/api/v3/ticker/24hr?symbol={binance_symbol}",
                timeout=TIMEOUT
            ) as response:
                response.raise_for_status()
                data = await response.json()
                if 'lastPrice' not in data:
                    logger.error(f"Binance API did not return price for {binance_symbol}: {data}")
                    return binance_data
                binance_data['price'] = float(data.get('lastPrice', 0))
                binance_data['price_change_24h'] = float(data.get('priceChangePercent', 0))
                binance_data['volume_24h'] = float(data.get('volume', 0))

            async with session.get(
                f"https://api.binance.com/api/v3/klines?symbol={binance_symbol}&interval=1h&limit=2",
                timeout=TIMEOUT
            ) as response:
                response.raise_for_status()
                klines_1h = await response.json()
                if len(klines_1h) >= 2:
                    price_1h_ago = float(klines_1h[0][4])
                    current_price = binance_data['price']
                    binance_data['price_change_1h'] = ((current_price - price_1h_ago) / price_1h_ago * 100) if price_1h_ago != 0 else 0

            async with session.get(
                f"https://api.binance.com/api/v3/klines?symbol={binance_symbol}&interval=1d&limit=8",
                timeout=TIMEOUT
            ) as response:
                response.raise_for_status()
                klines_7d = await response.json()
                if len(klines_7d) >= 8:
                    price_7d_ago = float(klines_7d[0][4])
                    binance_data['price_change_7d'] = ((current_price - price_7d_ago) / price_7d_ago * 100) if price_7d_ago != 0 else 0

        except aiohttp.ClientResponseError as e:
            logger.error(f"HTTP error fetching Binance data for {binance_symbol}: {str(e)}")
        except Exception as e:
            logger.error(f"Error fetching Binance data for {binance_symbol}: {str(e)}")

    return binance_data

# Helper function to get coin ID from preloaded data
def get_coin_id(coin_name_or_symbol):
    if not coin_name_or_symbol:
        return None

    coin_name_or_symbol = coin_name_or_symbol.lower()
    if coin_name_or_symbol.endswith("usdt"):
        coin_name_or_symbol = coin_name_or_symbol[:-4]

    common_coins = {
        'btc': 'bitcoin',
        'eth': 'ethereum',
        'bnb': 'binancecoin',
        'ada': 'cardano',
        'xrp': 'ripple',
        'sol': 'solana',
        'dot': 'polkadot',
        'matic': 'polygon',
        'avax': 'avalanche',
        'link': 'chainlink'
    }

    if coin_name_or_symbol in common_coins:
        return common_coins[coin_name_or_symbol]

    return COINS_DATA.get(coin_name_or_symbol)

# Helper function to get list of available coins from preloaded data
def get_available_coins():
    return list(COINS_DATA.keys())[:10] if COINS_DATA else ['BTC', 'ETH', 'BNB', 'ADA', 'XRP']

# Helper function to get news for a coin from preloaded data
def get_news(coin_id):
    return NEWS_DATA.get(coin_id, [])

# Helper function to calculate portfolio profit using preloaded data
def calculate_portfolio_profit(user_id):
    portfolio = PORTFOLIO_DATA.get(user_id, [])
    if not portfolio:
        return 0.0

    total_profit = 0.0
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    for item in portfolio:
        symbol = item['symbol'].upper()
        binance_data = loop.run_until_complete(fetch_binance_data(symbol))
        if binance_data['price']:
            amount = float(item['amount'])
            purchase_price = float(item['purchase_price'])
            current_price = binance_data['price']
            profit = (current_price - purchase_price) * amount
            total_profit += profit
    loop.close()
    return total_profit

# Helper function to set price alert
def set_price_alert(user_id, coin_id, symbol, target_price, direction):
    alert_data = {
        'user_id': user_id,
        'coin_id': coin_id,
        'symbol': symbol,
        'target_price': target_price,
        'direction': direction,
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    if redis_client:
        try:
            alert_key = f"price_alert:{user_id}:{coin_id}"
            redis_client.setex(alert_key, 86400, json.dumps(alert_data))
            logger.info(f"Price alert set for {symbol} at ${target_price}")
        except redis.RedisError as e:
            logger.error(f"Error setting price alert: {str(e)}")

# Helper function to check price alerts
async def check_price_alerts(user_id, symbol):
    if not redis_client:
        return None

    alert_key = f"price_alert:{user_id}:*"
    keys = redis_client.keys(alert_key)
    for key in keys:
        try:
            alert_data = json.loads(redis_client.get(key))
            if alert_data['symbol'].lower() == symbol.lower():
                binance_data = await fetch_binance_data(symbol)
                current_price = binance_data['price']
                target_price = float(alert_data['target_price'])
                direction = alert_data['direction']

                if direction == 'above' and current_price >= target_price:
                    return f"Cảnh báo: Giá {symbol} đã vượt ngưỡng ${target_price}! Giá hiện tại: ${current_price:,.2f}."
                elif direction == 'below' and current_price <= target_price:
                    return f"Cảnh báo: Giá {symbol} đã giảm xuống dưới ${target_price}! Giá hiện tại: ${current_price:,.2f}."
        except redis.RedisError as e:
            logger.error(f"Error checking price alert: {str(e)}")
    return None

# Helper function to call Gemini API for natural language understanding and response
def call_gemini_api(message, user_id):
    # Check Redis cache first
    cache_key = f"gemini_response:{message}:{user_id}"
    if redis_client:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                logger.info(f"Cache hit for Gemini response: {message}")
                return json.loads(cached_result)
        except redis.RedisError as e:
            logger.warning(f"Redis error while fetching cache: {str(e)}")

    # Handle simple greetings without calling Gemini API
    message_lower = message.lower().strip()
    if message_lower in ['xin chào', 'chào', 'hello', 'hi']:
        return {"response": "Xin chào! Bạn khỏe không? Tôi có thể giúp gì cho bạn hôm nay?"}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GEMINI_API_KEY}"
    }

    # Limit the size of preloaded data to avoid exceeding Gemini API limits
    limited_coins_data = dict(list(COINS_DATA.items())[:50])  # Limit to 50 coins
    limited_news_data = {k: v[:3] for k, v in NEWS_DATA.items()}  # Limit to 3 news items per coin
    limited_portfolio_data = {k: v[:10] for k, v in PORTFOLIO_DATA.items()}  # Limit to 10 portfolio items per user

    # Prompt để Gemini API tự hiểu và trả lời câu hỏi
    prompt = f"""
    Bạn là một trợ lý AI thông minh, có khả năng trả lời các câu hỏi bằng tiếng Việt một cách tự nhiên. Bạn chuyên về tiền điện tử và Binance, nhưng cũng có thể trả lời các câu hỏi bên ngoài lĩnh vực này một cách linh hoạt. Dữ liệu từ cơ sở dữ liệu đã được tải sẵn, bạn sẽ sử dụng dữ liệu này để trả lời các câu hỏi liên quan đến coin, tin tức, danh mục đầu tư, v.v.

    **Dữ liệu đã tải sẵn từ cơ sở dữ liệu:**
    - **Danh sách coin (COINS_DATA):** {json.dumps(limited_coins_data, ensure_ascii=False)}
    - **Tin tức (NEWS_DATA):** {json.dumps(limited_news_data, ensure_ascii=False)}
    - **Danh mục đầu tư (PORTFOLIO_DATA):** {json.dumps(limited_portfolio_data, ensure_ascii=False)}

    **Ngữ cảnh và khả năng:**
    - Hiểu các câu hỏi tiếng Việt tự nhiên, bao gồm cả các từ viết tắt (như 'BTC', 'ETH') và các câu không chuẩn ngữ pháp (như 'BTC hiện tại giá bao nhiêu').
    - Trả lời các câu hỏi liên quan đến tiền điện tử và Binance (giá coin, xu hướng giá, khối lượng giao dịch, tin tức, danh mục đầu tư, phí giao dịch, bảo mật tài khoản, loại lệnh, công cụ giao dịch, hướng dẫn giao dịch, đăng ký tài khoản, khắc phục sự cố, hỗ trợ khách hàng, lời khuyên đầu tư, danh sách coin, v.v.) bằng cách sử dụng dữ liệu đã tải sẵn.
    - Trả lời các câu hỏi bên ngoài lĩnh vực tiền điện tử và Binance một cách tự nhiên, ví dụ: trả lời lời chào, câu hỏi thông thường, hoặc các câu hỏi về kiến thức chung.
    - Sử dụng dữ liệu đã tải sẵn từ cơ sở dữ liệu để trả lời các câu hỏi liên quan đến coin, tin tức, danh mục đầu tư, v.v.
    - Nếu cần dữ liệu thời gian thực (như giá coin hiện tại), có thể gọi các hàm bên ngoài (được mô tả bên dưới).

    **Các hàm bạn có thể sử dụng (trả về dữ liệu thời gian thực, chỉ dùng khi cần):**
    1. fetch_binance_data(symbol): Lấy dữ liệu giá của một coin từ Binance. Ví dụ: fetch_binance_data('BTC') trả về:
       - price: Giá hiện tại (USD)
       - price_change_24h: % thay đổi giá 24h
       - volume_24h: Khối lượng giao dịch 24h
       - price_change_1h: % thay đổi giá 1h
       - price_change_7d: % thay đổi giá 7d
    2. set_price_alert(user_id, coin_id, symbol, target_price, direction): Đặt cảnh báo giá (direction là 'above' hoặc 'below').
    3. check_price_alerts(user_id, symbol): Kiểm tra xem có cảnh báo giá nào được kích hoạt không (trả về chuỗi thông báo hoặc None).

    **Hướng dẫn:**
    - Suy luận ngữ cảnh của câu hỏi và trả lời một cách tự nhiên, không cần phân loại ý định.
    - Sử dụng dữ liệu đã tải sẵn từ COINS_DATA, NEWS_DATA, PORTFOLIO_DATA để trả lời các câu hỏi liên quan đến coin, tin tức, danh mục đầu tư, v.v.
    - Nếu câu hỏi yêu cầu dữ liệu thời gian thực (như giá coin hiện tại), sử dụng fetch_binance_data() để lấy dữ liệu.
    - Nếu câu hỏi yêu cầu dữ liệu mà không có trong dữ liệu đã tải (ví dụ: coin không tồn tại), trả lời một cách tự nhiên, ví dụ: "Không tìm thấy thông tin về [coin]."
    - Nếu câu hỏi liên quan đến danh mục đầu tư mà không có user_id (user_id = 'anonymous'), trả lời: "Vui lòng cung cấp user_id để xem danh mục đầu tư."
    - Trả lời bằng tiếng Việt, ngắn gọn và tự nhiên.

    **Ví dụ:**
    - Câu hỏi: 'BTC hiện tại giá bao nhiêu'
      Trả lời: Sử dụng fetch_binance_data('BTC') để lấy giá, sau đó trả lời: "Giá BTC hiện tại là $60,000.00."
    - Câu hỏi: 'nên đầu tư coin nào'
      Trả lời: Sử dụng fetch_binance_data() cho một số coin phổ biến (như BTC, ETH, BNB), phân tích xu hướng và đưa ra gợi ý: "Dựa trên xu hướng gần đây, BTC đang tăng 2.5% trong 24h, có thể là một lựa chọn tốt. Tuy nhiên, hãy nghiên cứu kỹ trước khi đầu tư!"
    - Câu hỏi: 'trang web có những coin nào'
      Trả lời: Sử dụng COINS_DATA và trả lời: "Binance hỗ trợ nhiều coin, ví dụ: . Bạn có thể xem danh sách đầy đủ trên trang web Binance!"
    - Câu hỏi: 'tin tức về BTC'
      Trả lời: Sử dụng NEWS_DATA để lấy tin tức về coin_id của BTC, trả lời: "Tin tức mới nhất về BTC: ."
    - Câu hỏi: 'danh mục đầu tư của tôi thế nào'
      Trả lời: Sử dụng PORTFOLIO_DATA và fetch_binance_data() để tính lợi nhuận: "Lợi nhuận/thua lỗ của bạn hiện tại là $X."
    - Câu hỏi: 'xin chào'
      Trả lời: "Xin chào! Bạn khỏe không? Tôi có thể giúp gì cho bạn hôm nay?"

    **Câu hỏi hiện tại:**
    - User_id: {user_id}
    - Câu hỏi: '{message}'

    Trả lời trực tiếp dưới dạng JSON với trường "response" chứa câu trả lời bằng tiếng Việt.
    """
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        logger.debug(f"Gemini API raw response: {result}")  # Log raw response for debugging
        gemini_response = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
        logger.debug(f"Extracted Gemini response: {gemini_response}")  # Log extracted response
        parsed_response = json.loads(gemini_response)
        logger.info(f"Successfully parsed Gemini response: {parsed_response}")

        # Cache the result in Redis
        if redis_client:
            try:
                redis_client.setex(cache_key, CACHE_TTL, json.dumps(parsed_response))
                logger.info(f"Cache set for Gemini response: {message}")
            except redis.RedisError as e:
                logger.warning(f"Redis error while setting cache: {str(e)}")

        return parsed_response
    except requests.RequestException as e:
        logger.error(f"HTTP error calling Gemini API: {str(e)}")
        return {"response": "Có lỗi khi gọi Gemini API. Vui lòng kiểm tra kết nối hoặc thử lại sau."}
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error in Gemini response: {str(e)}")
        return {"response": "Có lỗi khi xử lý phản hồi từ Gemini API. Vui lòng thử lại sau."}
    except Exception as e:
        logger.error(f"Unexpected error calling Gemini API: {str(e)}")
        return {"response": "Có lỗi không xác định khi xử lý câu hỏi. Vui lòng thử lại sau."}

# Chatbot endpoint
@chatbot_bp.route('/', methods=['POST'])
def chatbot():
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'anonymous')
        message = data.get('message')

        if not message:
            return jsonify({'error': 'Yêu cầu phải có nội dung tin nhắn.'}), 400

        # Call Gemini API to handle the query naturally
        response_data = call_gemini_api(message, user_id)
        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error in chatbot: {str(e)}")
        return jsonify({'error': str(e)}), 500