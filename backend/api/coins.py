from flask import Blueprint, jsonify
from flask_cors import CORS
import logging
import aiohttp
import asyncio
import requests
import redis
import json
from .clickhouse_config import execute_clickhouse_query, DATABASE  # Import from clickhouse_config.py

# Initialize the Blueprint for coins routes
coins_bp = Blueprint('coins', __name__)
CORS(coins_bp, supports_credentials=True, origins="*")

# Set up logging
logger = logging.getLogger(__name__)

# Timeout configuration for HTTP requests
TIMEOUT = 5  # 5 seconds timeout for each API request

# Redis connection for caching
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    redis_client.ping()  # Test the connection
    logger.info("Connected to Redis successfully")
except redis.RedisError as e:
    logger.warning(f"Failed to connect to Redis: {str(e)}. Proceeding without caching.")
    redis_client = None

CACHE_TTL = 300  # Cache for 5 minutes (300 seconds)

# Fetch CoinGecko coin list and create symbol-to-ID mapping at startup
try:
    coin_list_url = "https://api.coingecko.com/api/v3/coins/list"
    coin_list_response = requests.get(coin_list_url, timeout=TIMEOUT)
    coin_list_response.raise_for_status()
    coin_list = coin_list_response.json()
    symbol_to_id = {coin['symbol'].lower(): coin['id'] for coin in coin_list}
    logger.info(f"Loaded {len(symbol_to_id)} coin mappings from CoinGecko")
except Exception as e:
    logger.error(f"Failed to fetch CoinGecko coin list: {str(e)}")
    symbol_to_id = {}

# Helper function to fetch real-time data from Binance
async def fetch_binance_data(session, symbol):
    """
    Fetch real-time data for a given symbol from Binance using async HTTP requests.
    Returns a dictionary with price, 1h%, 24h%, 7d%, and volume (24h).
    Note: market_cap and circulating_supply are fetched separately in batch.
    """
    binance_symbol = symbol  # e.g., LINKUSDT
    binance_data = {
        'price': None,
        'price_change_1h': None,
        'price_change_24h': None,
        'price_change_7d': None,
        'volume_24h': None
    }

    try:
        # Fetch price and 24h data from Binance
        async with session.get(
            f"https://api.binance.com/api/v3/ticker/24hr?symbol={binance_symbol}",
            timeout=TIMEOUT
        ) as response:
            response.raise_for_status()
            data = await response.json()
            binance_data['price'] = float(data.get('lastPrice', 0))
            binance_data['price_change_24h'] = float(data.get('priceChangePercent', 0))
            binance_data['volume_24h'] = float(data.get('volume', 0))

        # Fetch 1h price change
        async with session.get(
            f"https://api.binance.com/api/v3/klines?symbol={binance_symbol}&interval=1h&limit=2",
            timeout=TIMEOUT
        ) as response:
            response.raise_for_status()
            klines_1h = await response.json()
            if len(klines_1h) >= 2:
                price_1h_ago = float(klines_1h[0][4])  # Closing price 1h ago
                current_price = binance_data['price']
                binance_data['price_change_1h'] = ((current_price - price_1h_ago) / price_1h_ago * 100) if price_1h_ago != 0 else 0

        # Fetch 7d price change
        async with session.get(
            f"https://api.binance.com/api/v3/klines?symbol={binance_symbol}&interval=1d&limit=8",
            timeout=TIMEOUT
        ) as response:
            response.raise_for_status()
            klines_7d = await response.json()
            if len(klines_7d) >= 8:
                price_7d_ago = float(klines_7d[0][4])  # Closing price 7d ago
                binance_data['price_change_7d'] = ((current_price - price_7d_ago) / price_7d_ago * 100) if price_7d_ago != 0 else 0

    except Exception as e:
        logger.error(f"Error fetching Binance data for {binance_symbol}: {str(e)}")

    return binance_data

# Helper function to fetch market cap and circulating supply for multiple coins in batch
async def fetch_coingecko_batch(session, coin_ids):
    """
    Fetch market cap and circulating supply for multiple coins in a single request using /coins/markets.
    Returns a dictionary mapping coin_id to {market_cap, circulating_supply}.
    """
    if not coin_ids:
        return {}

    # Check Redis cache first
    cache_key = "coingecko_batch:" + ":".join(sorted(coin_ids))
    cached_data = None
    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                logger.info(f"Cache hit for CoinGecko batch: {cache_key}")
                return json.loads(cached_data)
        except redis.RedisError as e:
            logger.warning(f"Redis error while fetching cache: {str(e)}. Proceeding without cache.")

    # Fetch data in batch using /coins/markets
    try:
        params = {
            'vs_currency': 'usd',
            'ids': ','.join(coin_ids),  # e.g., "aave,chainlink,bitcoin"
            'per_page': len(coin_ids),
            'page': 1
        }
        async with session.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            params=params,
            timeout=TIMEOUT
        ) as response:
            if response.status == 429:
                logger.warning("CoinGecko rate limit hit during batch request")
                return {}
            response.raise_for_status()
            coins_data = await response.json()

        # Map coin_id to market_cap and circulating_supply
        result = {}
        for coin_data in coins_data:
            coin_id = coin_data['id']
            result[coin_id] = {
                'market_cap': coin_data.get('market_cap', 0),
                'circulating_supply': coin_data.get('circulating_supply', 0)
            }

        # Cache the result in Redis if available
        if redis_client:
            try:
                redis_client.setex(cache_key, CACHE_TTL, json.dumps(result))
                logger.info(f"Cache set for CoinGecko batch: {cache_key}")
            except redis.RedisError as e:
                logger.warning(f"Redis error while setting cache: {str(e)}")

        return result

    except Exception as e:
        logger.error(f"Error fetching CoinGecko batch data: {str(e)}")
        return {}

# API endpoint to get coin data (publicly accessible)
@coins_bp.route('/', methods=['GET'])
def get_coins():
    try:
        # Fetch coin data from ClickHouse (only metadata, no market data)
        query = """
        SELECT
            c.coin_id,
            c.name,
            c.symbol,
            c.image_url
        FROM {db}.coins c
        ORDER BY c.name ASC
        """.format(db=DATABASE)

        logger.info(f"Executing query: {query}")
        result = execute_clickhouse_query(query)
        logger.info(f"Query result: {result}")

        # Map symbols to CoinGecko IDs for batch fetching
        coin_id_map = {}  # symbol -> coingecko_id
        for row in result.get('data', []):
            symbol = row['symbol'].upper()  # e.g., LINKUSDT
            coin_symbol = symbol.replace('USDT', '').lower()  # e.g., link
            coingecko_id = symbol_to_id.get(coin_symbol)
            if coingecko_id:
                coin_id_map[symbol] = coingecko_id
            else:
                logger.warning(f"No CoinGecko ID found for symbol {coin_symbol}")

        # Fetch market data for all coins concurrently (Binance data)
        async def fetch_all_binance_data():
            async with aiohttp.ClientSession() as session:
                tasks = [fetch_binance_data(session, row['symbol'].upper()) for row in result.get('data', [])]
                return await asyncio.gather(*tasks)

        # Fetch CoinGecko data in batch
        async def fetch_all_coingecko_data():
            async with aiohttp.ClientSession() as session:
                coingecko_data = await fetch_coingecko_batch(session, list(set(coin_id_map.values())))
                return coingecko_data

        # Run async tasks in the event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        binance_data_list = loop.run_until_complete(fetch_all_binance_data())
        coingecko_data = loop.run_until_complete(fetch_all_coingecko_data())
        loop.close()

        coins = []
        for idx, (row, binance_data) in enumerate(zip(result.get('data', []), binance_data_list), start=1):
            try:
                # Log the raw row for debugging
                logger.debug(f"Processing row: {row}")

                symbol = row['symbol'].upper()
                coingecko_id = coin_id_map.get(symbol)
                coingecko_coin_data = coingecko_data.get(coingecko_id, {}) if coingecko_id else {}

                # Construct the coin data object
                coin = {
                    'index': idx,  # Row number
                    'coin_id': row.get('coin_id', 'unknown'),
                    'name': row.get('name', 'Unknown'),
                    'image_url': row.get('image_url', "https://via.placeholder.com/20"),
                    'price': f"${binance_data['price']:,.2f}" if binance_data['price'] is not None else "N/A",
                    'price_change_1h': f"{binance_data['price_change_1h']:.2f}%" if binance_data['price_change_1h'] is not None else "N/A",
                    'price_change_24h': f"{binance_data['price_change_24h']:.2f}%" if binance_data['price_change_24h'] is not None else "N/A",
                    'price_change_7d': f"{binance_data['price_change_7d']:.2f}%" if binance_data['price_change_7d'] is not None else "N/A",
                    'market_cap': f"{coingecko_coin_data.get('market_cap', 0):,.2f}" if coingecko_coin_data.get('market_cap') is not None else "N/A",
                    'volume_24h': f"{binance_data['volume_24h']:,.2f}" if binance_data['volume_24h'] is not None else "N/A",
                    'circulating_supply': f"{coingecko_coin_data.get('circulating_supply', 0):,.2f}" if coingecko_coin_data.get('circulating_supply') is not None else "N/A",
                    'symbol': symbol
                }
                coins.append(coin)
            except Exception as e:
                logger.error(f"Error parsing row {row}: {str(e)}")
                continue

        if not coins:
            logger.info("No coins found")
            return jsonify({'coins': []}), 200

        logger.info(f"Returning {len(coins)} coins")
        return jsonify({'coins': coins}), 200

    except Exception as e:
        logger.error(f"Error in get_coins: {str(e)}")
        return jsonify({'error': str(e)}), 500