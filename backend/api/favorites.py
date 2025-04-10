from flask import Blueprint, request, jsonify
import pytz
from datetime import datetime
import uuid
from flask_cors import CORS
import logging
from .clickhouse_config import execute_clickhouse_query, DATABASE

# Initialize the Blueprint for favorites routes
favorites_bp = Blueprint('favorites', __name__)
CORS(favorites_bp, supports_credentials=True, origins="*")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Helper function to validate user_id
def validate_user(user_id):
    try:
        query = f"SELECT * FROM {DATABASE}.users WHERE user_id = %(user_id)s"
        result = execute_clickhouse_query(query, params={"user_id": user_id})
        return bool(result.get('data', []))
    except Exception as e:
        logger.error(f"Error validating user_id {user_id}: {str(e)}")
        raise

# Helper function to validate coin_id
def validate_coin(coin_id):
    try:
        query = f"SELECT * FROM {DATABASE}.coins WHERE coin_id = %(coin_id)s"
        result = execute_clickhouse_query(query, params={"coin_id": coin_id})
        return bool(result.get('data', []))
    except Exception as e:
        logger.error(f"Error validating coin_id {coin_id}: {str(e)}")
        raise

# Helper function to check if a coin is already in the user's favorites
def is_favorite(user_id, coin_id):
    try:
        query = f"""
        SELECT * FROM {DATABASE}.favorites 
        WHERE user_id = %(user_id)s AND coin_id = %(coin_id)s
        """
        result = execute_clickhouse_query(query, params={"user_id": user_id, "coin_id": coin_id})
        return bool(result.get('data', []))
    except Exception as e:
        logger.error(f"Error checking if coin {coin_id} is favorite for user {user_id}: {str(e)}")
        raise

# Add a coin to the user's favorites
@favorites_bp.route('/add', methods=['POST'])
def add_to_favorites():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        coin_id = data.get('coin_id')

        # Validate required fields
        if not all([user_id, coin_id]):
            return jsonify({'error': 'Missing required fields (user_id, coin_id)'}), 400

        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404

        # Validate coin_id
        if not validate_coin(coin_id):
            return jsonify({'error': 'Invalid coin_id'}), 404

        # Check if the coin is already in favorites
        if is_favorite(user_id, coin_id):
            return jsonify({'error': 'Coin is already in favorites'}), 400

        # Insert into favorites
        vietnam_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        added_at = datetime.now(vietnam_tz).strftime('%Y-%m-%d %H:%M:%S')
        favorite_id = str(uuid.uuid4())

        insert_query = f"""
        INSERT INTO {DATABASE}.favorites (favorite_id, user_id, coin_id, added_at)
        VALUES (%(favorite_id)s, %(user_id)s, %(coin_id)s, %(added_at)s)
        """
        execute_clickhouse_query(insert_query, params={
            "favorite_id": favorite_id,
            "user_id": user_id,
            "coin_id": coin_id,
            "added_at": added_at
        })

        return jsonify({'message': 'Coin added to favorites successfully', 'favorite_id': favorite_id}), 201

    except Exception as e:
        logger.error(f"Error in add_to_favorites: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Remove a coin from the user's favorites
@favorites_bp.route('/remove', methods=['POST'])
def remove_from_favorites():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        coin_id = data.get('coin_id')

        # Validate required fields
        if not all([user_id, coin_id]):
            return jsonify({'error': 'Missing required fields (user_id, coin_id)'}), 400

        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404

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
        logger.error(f"Error in remove_from_favorites: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Get the user's favorite coins
@favorites_bp.route('/', methods=['GET'])
def get_favorites():
    try:
        user_id = request.args.get('user_id')
        logger.info(f"Fetching favorites for user_id: {user_id}")

        if not user_id:
            return jsonify({'error': 'Missing user_id parameter'}), 400

        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404

        # Fetch favorite coins with coin details and market data
        query = f"""
        SELECT 
    f.favorite_id,
    f.user_id, 
    f.coin_id AS coin_id,
    c.name, 
    c.symbol, 
    c.image_url, 
    f.added_at,
    toString(m.price) AS price,
    toString(m.price_change_24h) AS price_change_24h
FROM {DATABASE}.favorites f
JOIN {DATABASE}.coins c 
    ON f.coin_id = c.coin_id
JOIN {DATABASE}.market_data m 
    ON f.coin_id = m.coin_id
JOIN (
    SELECT 
        coin_id, 
        max(updated_date) AS max_updated
    FROM {DATABASE}.market_data
    GROUP BY coin_id
) latest
    ON m.coin_id = latest.coin_id AND m.updated_date = latest.max_updated
        """
        logger.info(f"Executing query: {query}")
        result = execute_clickhouse_query(query, params={"user_id": user_id})
        logger.info(f"Query result: {result}")

        favorites = []
        for row in result.get('data', []):
            try:
                # Log the raw row for debugging
                logger.debug(f"Processing row: {row}")
                
                # Safely parse price and price_change_24h
                price = None
                price_change = None
                try:
                    price_str = row.get('price')
                    price = float(price_str) if price_str is not None and price_str != '' else None
                except (ValueError, TypeError) as e:
                    logger.warning(f"Failed to parse price for row {row}: {str(e)}")
                    price = None  # Fallback instead of skipping
                
                try:
                    price_change_str = row.get('price_change_24h')
                    price_change = float(price_change_str) if price_change_str is not None and price_change_str != '' else None
                except (ValueError, TypeError) as e:
                    logger.warning(f"Failed to parse price_change_24h for row {row}: {str(e)}")
                    price_change = None  # Fallback instead of skipping

                # Use row.get() for all fields to avoid KeyError
                favorite = {
                    'id': row.get('favorite_id', 'unknown_id'),
                    'user_id': row.get('user_id', 'unknown_user'),
                    'coin_id': row.get('coin_id', 'unknown_coin'),
                    'name': row.get('name', 'Unknown'),
                    'price': f"${price:,.2f}" if price is not None else "N/A",
                    'change': f"{price_change:.2f}%" if price_change is not None else "N/A",
                    'logo': row.get('image_url', "https://via.placeholder.com/20"),
                    'added_at': row.get('added_at', 'unknown_date')
                }
                favorites.append(favorite)
            except Exception as e:
                logger.error(f"Error parsing row {row}: {str(e)}")
                continue

        logger.info(f"Returning {len(favorites)} favorites for user_id: {user_id}")
        return jsonify({'favorites': favorites}), 200

    except Exception as e:
        logger.error(f"Error in get_favorites: {str(e)}")
        return jsonify({'error': str(e)}), 500