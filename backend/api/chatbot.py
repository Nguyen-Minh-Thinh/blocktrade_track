from google import genai
from google.genai import types
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from datetime import datetime
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from dotenv import dotenv_values
import pathlib
import re

from flask_jwt_extended import jwt_required
import clickhouse_connect
import logging

script_path = pathlib.Path(__file__).parent.resolve()
config = dotenv_values(f'{script_path.parent}/.env')
api_key = config['GEMINI_API_KEY']


# Initialize the Blueprint for favorites routes
chatbot_bp = Blueprint('chatbot', __name__)
CORS(chatbot_bp, supports_credentials=True, origins="*")
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
clickhouse_client = clickhouse_connect.get_client(
                host='localhost',
                port='8124',
                user='default',
                password='123456',
                database='blocktrade_track'
            )
# Helper function to validate user_id
def validate_user(user_id):
    try:
        query = f"SELECT * FROM blocktrade_track.users WHERE user_id = %(user_id)s"
        result = clickhouse_client.query(query, parameters={'user_id': user_id}).result_rows
        return bool(result.get('data', []))
    except Exception as e:
        logger.error(f"Error validating user_id {user_id}: {str(e)}")
        raise

def build_prompt(user_question, is_authenticated=False):
    if is_authenticated:
        schema = '''
        Bảng users(user_id, name, email, username, created_at, points)  -- Đây là bảng chứa thông tin người dùng
        Bảng portfolio(portfolio_id, user_id, coin_id, amount, purchase_price, added_at)    -- Đây là bảng chứa danh mục đầu tư của người dùng
        Bảng transactions(transaction_id, user_id, coin_id, type, amount, price, points_spent, trans_date)  -- Đây là bảng chứa thông tin giao dịch của người dùng
        Bảng favorites(favorite_id, user_id, coin_id, added_at) -- Đây là bảng chứa các đồng coin mà người dùng yêu thích 
        Bảng coins(coin_id, name, symbol, image_url)    -- Đây là bảng chứa thông tin của các đồng coins
        Bảng market_data(coin_id, price, market_cap, volume_24h, price_change_24h, circulating_supply, updated_date) -- Đây là bảng dữ liệu thị trường
        Bảng news(news_id, title, news_link, source_name, updated_at, coin_id)  -- Đây là bảng tin tức
        '''
        return f"""
            Bạn là một trợ lý cơ sở dữ liệu thông minh.
            Người dùng đã đăng nhập và có `user_id` là {{user_id}} (hãy sử dụng giá trị này trong truy vấn nếu cần lấy dữ liệu cá nhân).

            Câu hỏi của người dùng: "{user_question}"

            Chỉ sử dụng các bảng được cung cấp sau:
            {schema}

            Yêu cầu:
            - Viết một câu lệnh SQL dành cho ClickHouse.
            - Nếu câu hỏi liên quan đến dữ liệu cá nhân (ví dụ: "của tôi", "của người dùng", "tôi đã", "tôi thích",...), **phải lọc dữ liệu bằng điều kiện**: `user_id = '{{user_id}}'`
            - Không được dùng trực tiếp giá trị của `user_id`, chỉ được dùng placeholder `{{user_id}}` như ví dụ trên.
            - Không bao giờ dùng dấu `;` ở cuối câu SQL.
            - Trả về **chỉ duy nhất** câu lệnh SQL, không có bất kỳ giải thích hoặc nhận xét nào.
        """
    else:
        schema = '''
        Bảng coins(coin_id, name, symbol, image_url)  -- Đây là bảng chứa thông tin của các đồng coins
        Bảng market_data(coin_id, price, market_cap, volume_24h, price_change_24h, circulating_supply, updated_date)    -- Đây là bảng dữ liệu thị trường
        Bảng news(news_id, title, news_link, source_name, updated_at, coin_id)   -- Đây là bảng tin tức
        '''

        return f"""
            Bạn là một trợ lý cơ sở dữ liệu thông minh.
            Người dùng chưa đăng nhập.

            Câu hỏi của người dùng: "{user_question}"

            Chỉ sử dụng các bảng được cung cấp sau:
            {schema}

            Yêu cầu:
            - Nếu câu hỏi yêu cầu thông tin cá nhân (như: "của tôi", "tôi đã đầu tư gì", "tôi yêu thích những coin nào", ...) thì **không trả lời gì cả**.
            - Nếu câu hỏi không yêu cầu thông tin cá nhân, mà có thể trả lời bằng dữ liệu từ các bảng trong schema, hãy viết một câu lệnh SQL dành cho ClickHouse để trả lời.
            - Không bao giờ dùng dấu `;` ở cuối câu SQL.
            - Truy vấn tin tức là từ bảng `news` (không phải `new`).
            - Trả về **chỉ duy nhất** câu lệnh SQL, không có lời giải thích hoặc nội dung nào khác.
        """





@chatbot_bp.route('', methods=['POST'])
def check_user_status():
    try:
        data = request.json
        user_question = data.get("question")
        # Cho phép truy cập không cần token (optional=True)
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        # print(user_id)
        is_authenticated = bool(user_id)
        prompt = build_prompt(user_question, is_authenticated)
    except Exception as e:
        prompt = build_prompt(user_question, False)
        is_authenticated = False
        user_id = None
    finally:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash-001', contents=prompt
        )
        generated_text = response.text.strip()
        if not is_authenticated and (
            "không thể trả lời" in generated_text.lower()):
            return jsonify({
                "answer": "Xin lỗi, mình chưa thể trả lời câu hỏi này vì cần thêm thông tin từ người dùng. Hãy đăng nhập để tiếp tục nhé!"
            }), 200
        if "select" not in generated_text.lower():
            return jsonify({
                "answer": generated_text.strip().strip("```sql").strip("```").strip()
            }), 200
        # print(generated_text.strip())
        sql_query = generated_text.strip().strip("```sql").strip("```").strip()

        try:
            
            if is_authenticated and "{{user_id}}" in sql_query:
                sql_query = sql_query.replace("{{user_id}}", f"'{user_id}'")
            # Kiểm tra và thay thế chính xác "new"
            if re.search(r'\bnew\b', sql_query.lower()):
                sql_query = re.sub(r'\bnew\b', 'news', sql_query.lower())
            sql_query = sql_query.strip().strip("```sql").strip("```").strip()
            # print(sql_query)
            try:
                # print(sql_query)
                result = clickhouse_client.query(sql_query)
                row = result.result_rows[0]
                # print(row)
                columns = result.column_names
                # print(columns)
                response2 = client.models.generate_content(
                    model='gemini-2.0-flash-001', contents=f"""Dựa vào câu hỏi này của người dùng {user_question} và câu trả lời từ database với hàng là: {row}, các cột là: {columns}.
                        Bạn hãy giúp tôi ghép nối câu hỏi và câu trả lời lại để có thể phản hồi giống với ngôn ngữ tự nhiên nhất nhưng ngắn gọn chỉ cần phản hồi thông tin quan trọng (Tránh trả lời thừa như: "câu trả lời trong database", ...)!""")
                return jsonify({
                    "answer": response2.text.strip()
                }), 200
            except Exception as e:
                return jsonify({
                    "answer": "Tôi không thể trả lời câu hỏi này của bạn!!!"
                }), 200
            

        except Exception as e:
            return jsonify({
                "error": "Truy vấn SQL bị lỗi.",
                "details": str(e),
                "sql": sql_query
            }), 200
