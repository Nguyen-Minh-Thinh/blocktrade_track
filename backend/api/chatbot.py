from google import genai
from google.genai import types
from flask import Blueprint, request, jsonify, session
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

@chatbot_bp.route('', methods=['POST'])
def check_user_status():
    try:
        data = request.json
        user_question = data.get("question")

        schema = '''
    Bảng coins (coin_id, name, symbol, image_url)    -- Đây là bảng chứa thông tin của các đồng coins
    Bảng market_data (coin_id, price, market_cap, volume_24h, price_change_24h, circulating_supply, updated_date) -- Đây là bảng dữ liệu thị trường
    Bảng news (news_id, title, news_link, source_name, updated_at, coin_id)  -- Đây là bảng tin tức
    '''
        # Xây dựng prompt đầy đủ
        prompt = f"""Bạn là một trợ lý thông minh có thể trả lời câu hỏi về thị trường tiền mã hóa dựa trên dữ liệu từ website của tôi.

    Câu hỏi của người dùng: "{user_question}"

    Chỉ sử dụng các bảng được cung cấp sau:
    {schema}

    Yêu cầu:
    1. Viết một câu lệnh SQL dành cho ClickHouse để trả lời câu hỏi. Không sử dụng dấu `;` ở cuối câu SQL.
    2. Nếu không có thông tin trong cơ sở dữ liệu của website, bạn có thể suy luận và cung cấp câu trả lời dựa trên kiến thức vốn có của mình về thị trường crypto.
    3. Đảm bảo câu trả lời của bạn là phù hợp với ngữ cảnh, ví dụ: nếu người dùng chào, bạn phải chào lại.
    4. Trả về chỉ duy nhất câu lệnh SQL nếu có thể hoặc cung cấp câu trả lời bình thường nếu không thể thực hiện SQL.
    5. Trả lời ngắn gọn, súc tích.
"""

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash-001', contents=prompt
        )
        generated_text = response.text.strip()
        sql_query = generated_text.strip().strip("```sql").strip("```").strip()

        try:
            result = clickhouse_client.query(sql_query)
            row = result.result_rows[0]
            columns = result.column_names
        except Exception as e:
            response3 = client.models.generate_content(
                model='gemini-2.0-flash-001',
                contents=f"""Hãy trả lời câu hỏi: {user_question} (câu trả lời dưới 30 chữ, đầy đủ ý chính)."""
            )
            bot_reply = response3.text.strip()
            session['chat_history'].append({"role": "bot", "message": bot_reply})
            return jsonify({"answer3": bot_reply}), 200

        else:
            response2 = client.models.generate_content(
                model='gemini-2.0-flash-001',
                contents=f"""Dựa vào câu hỏi: {user_question} và dữ liệu từ database: {row} (các cột: {columns}),
                hãy viết câu trả lời tự nhiên, ngắn gọn nhất có thể."""
            )
            bot_reply = response2.text.strip()
            session['chat_history'].append({"role": "bot", "message": bot_reply})
            return jsonify({"answer2": bot_reply}), 200

    except Exception as e:
        return jsonify({"answer": "Tôi không thể trả lời câu hỏi này của bạn!"}), 200
