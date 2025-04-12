from flask import Blueprint, request, jsonify
import pytz
from datetime import datetime
from .clickhouse_config import execute_clickhouse_query, DATABASE  # Nhập từ file mới


from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required  

# Initialize the Blueprint for news routes
news_bp = Blueprint('news', __name__)

# Helper function to validate user_id
def validate_user(user_id):
    query = f"SELECT * FROM {DATABASE}.users WHERE user_id = %(user_id)s"
    result = execute_clickhouse_query(query, params={"user_id": user_id})
    return bool(result.get('data', []))

# Helper function to validate coin_id
def validate_coin(coin_id):
    query = f"SELECT * FROM {DATABASE}.coins WHERE coin_id = %(coin_id)s"
    result = execute_clickhouse_query(query, params={"coin_id": coin_id})
    return bool(result.get('data', []))

@news_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all():
    try:
        user_id = get_jwt_identity()
        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404
        
        # Fetch news with coin details
        query = f"""
        SELECT n.news_id, n.title, n.news_link, n.source_name, n.updated_at, c.coin_id, c.name, c.symbol, c.image_url
        FROM {DATABASE}.news n
        JOIN {DATABASE}.coins c ON n.coin_id = c.coin_id
        """
        result = execute_clickhouse_query(query)
        news = [
            {
                "news_id": row["news_id"],
                "title": row["title"],  
                "news_link": row["news_link"],
                "source_name": row["source_name"],
                "updated_at": row["updated_at"],
                "coin_id": row["c.coin_id"],
                "coin_name": row["name"],
                "coin_symbol": row["symbol"],
                "coin_image_url": row["image_url"]
            }
            for row in result.get('data', [])
        ]

        return jsonify({"news": news})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@news_bp.route('/coin', methods=['GET'])
@jwt_required()
def get_by_coin_id():
    try:
        user_id = get_jwt_identity()
        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404
        
        coin_id = request.args.get('coin_id')
        # Validate coin_id
        if not validate_coin(coin_id):
            return jsonify({'error': 'Invalid coin_id'}), 404
        
        # Fetch news with coin details
        query = f"""
        SELECT n.news_id, n.title, n.news_link, n.source_name, n.updated_at, c.coin_id, c.name, c.symbol, c.image_url
        FROM {DATABASE}.news n
        JOIN {DATABASE}.coins c ON n.coin_id = c.coin_id
        WHERE c.coin_id = %(coin_id)s
        """
        result = execute_clickhouse_query(query, params={
            "coin_id": str(coin_id)
        })
        news = [
            {
                "news_id": row["news_id"],
                "title": row["title"],  
                "news_link": row["news_link"],
                "source_name": row["source_name"],
                "updated_at": row["updated_at"],
                "coin_id": row["c.coin_id"],
                "coin_name": row["name"],
                "coin_symbol": row["symbol"],
                "coin_image_url": row["image_url"]
            }
            for row in result.get('data', [])
        ]

        return jsonify({"news": news})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    



