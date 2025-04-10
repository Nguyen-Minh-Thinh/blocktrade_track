from flask import Blueprint, request, jsonify
import pytz
from datetime import datetime
from .clickhouse_config import execute_clickhouse_query, DATABASE  # Nhập từ file mới

from flask_jwt_extended import create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required


# Initialize the Blueprint for favorites routes
favorites_bp = Blueprint('favorites', __name__)

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

# Helper function to check if a coin is already in the user's favorites
def is_favorite(user_id, coin_id):
    query = f"""
    SELECT * FROM {DATABASE}.favorites 
    WHERE user_id = %(user_id)s AND coin_id = %(coin_id)s
    """
    result = execute_clickhouse_query(query, params={"user_id": user_id, "coin_id": coin_id})
    return bool(result.get('data', []))

# Add a coin to the user's favorites
@favorites_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_favorites():
    try:
        user_id = get_jwt_identity()
        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404
        data = request.get_json()
        coin_id = data.get('coin_id')

        # Validate required fields
        if not all([user_id, coin_id]):
            return jsonify({'error': 'Missing required fields (user_id, coin_id)'}), 400

        # Validate coin_id
        if not validate_coin(coin_id):
            return jsonify({'error': 'Invalid coin_id'}), 404

        # Check if the coin is already in favorites
        if is_favorite(user_id, coin_id):
            return jsonify({'error': 'Coin is already in favorites'}), 400

        # Insert into favorites
        vietnam_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        added_at = datetime.now(vietnam_tz).strftime('%Y-%m-%d %H:%M:%S')

        insert_query = f"""
        INSERT INTO {DATABASE}.favorites (user_id, coin_id, added_at)
        VALUES (%(user_id)s, %(coin_id)s, %(added_at)s)
        """
        execute_clickhouse_query(insert_query, params={
            "user_id": user_id,
            "coin_id": coin_id,
            "added_at": added_at
        })

        return jsonify({'message': 'Coin added to favorites successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Remove a coin from the user's favorites
@favorites_bp.route('/remove', methods=['POST'])
@jwt_required()
def remove_from_favorites():
    try:
        user_id = get_jwt_identity()
        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404
        data = request.get_json()
        coin_id = data.get('coin_id')

        # Validate required fields
        if not all([user_id, coin_id]):
            return jsonify({'error': 'Missing required fields (user_id, coin_id)'}), 400

        # Validate coin_id
        if not validate_coin(coin_id):
            return jsonify({'error': 'Invalid coin_id'}), 404

        # Check if the coin is in favorites
        if not is_favorite(user_id, coin_id):
            return jsonify({'error': 'Coin is not in favorites'}), 400

        # Delete from favorites
        delete_query = f"""
        ALTER TABLE {DATABASE}.favorites 
        DELETE WHERE user_id = %(user_id)s AND coin_id = %(coin_id)s
        """
        execute_clickhouse_query(delete_query, params={"user_id": user_id, "coin_id": coin_id})

        return jsonify({'message': 'Coin removed from favorites successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get the user's favorite coins
@favorites_bp.route('/', methods=['GET'])
@jwt_required()
def get_favorites():
    try:
        user_id = get_jwt_identity()
        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404

        # if not user_id:
        #     return jsonify({'error': 'Missing user_id parameter'}), 400
        # if not validate_user(user_id):
        #     return jsonify({'error': 'Invalid user_id'}), 404

        # Fetch favorite coins with coin details
        query = f"""
        SELECT f.user_id, f.coin_id, c.name, c.symbol, c.image_url, f.added_at
        FROM {DATABASE}.favorites f
        LEFT JOIN {DATABASE}.coins c ON f.coin_id = c.coin_id
        WHERE f.user_id = %(user_id)s
        ORDER BY f.added_at DESC
        """
        result = execute_clickhouse_query(query, params={"user_id": user_id})

        favorites = [
            {
                'user_id': row['user_id'],
                'coin_id': row['coin_id'],
                'coin_name': row['name'],
                'coin_symbol': row['symbol'],
                'coin_image_url': row['image_url'],
                'added_at': row['added_at']
            }
            for row in result.get('data', [])
        ]

        return jsonify({'favorites': favorites}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500