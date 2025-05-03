from flask import Blueprint, request, jsonify
import uuid
from datetime import datetime, timezone
from flask_cors import CORS
from .clickhouse_config import execute_clickhouse_query, DATABASE  # Nhập từ file mới

from flask_jwt_extended import create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required

# Initialize the Blueprint for portfolio routes
portfolio_bp = Blueprint('portfolio', __name__)
CORS(portfolio_bp, supports_credentials=True, origins="*")

# Conversion rate: 1 point = $1 (adjust as needed)
POINTS_PER_DOLLAR = 1

# Helper function to validate user_id and get user points
def get_user_points(user_id):
    query = f"SELECT points FROM {DATABASE}.users WHERE user_id = %(user_id)s"
    result = execute_clickhouse_query(query, params={"user_id": user_id})
    rows = result.get('data', [])
    if not rows:
        return None
    return float(rows[0]['points'])

# Helper function to update user points
def update_user_points(user_id, new_points):
    query = f"""
    ALTER TABLE {DATABASE}.users 
    UPDATE points = %(new_points)s 
    WHERE user_id = %(user_id)s
    """
    execute_clickhouse_query(query, params={"new_points": new_points, "user_id": user_id})

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

# Helper function to check if a portfolio entry exists for a user and coin
def get_portfolio_entry(user_id, coin_id):
    query = f"""
    SELECT portfolio_id, amount, purchase_price 
    FROM {DATABASE}.portfolio 
    WHERE user_id = %(user_id)s AND coin_id = %(coin_id)s
    """
    result = execute_clickhouse_query(query, params={"user_id": user_id, "coin_id": coin_id})
    rows = result.get('data', [])
    if rows:
        row = rows[0]
        return row['portfolio_id'], float(row['amount']), float(row['purchase_price'])
    return None

# Helper function to log a transaction
def log_transaction(user_id, coin_id, transaction_type, amount, price):
    points_spent = amount * price * POINTS_PER_DOLLAR

    insert_query = f"""
    INSERT INTO {DATABASE}.transactions (user_id, coin_id, type, amount, price, points_spent)
    VALUES (%(user_id)s, %(coin_id)s, %(type)s, %(amount)s, %(price)s, %(points_spent)s)
    """
    execute_clickhouse_query(insert_query, params={
        "user_id": user_id,
        "coin_id": coin_id,
        "type": transaction_type,  # 'buy' or 'sell'
        "amount": amount,
        "price": price,
        "points_spent": points_spent
    })

# Add or update a coin in the user's portfolio
@portfolio_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_portfolio():
    try:
        user_id = get_jwt_identity()
        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404
        data = request.get_json()
        coin_id = data.get('coin_id')
        amount = data.get('amount')
        purchase_price = data.get('purchase_price')

        # Validate required fields
        if not all([user_id, coin_id, amount, purchase_price]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate coin_id
        if not validate_coin(coin_id):
            return jsonify({'error': 'Invalid coin_id'}), 404

        # Validate amount and purchase_price
        try:
            amount = float(amount)
            purchase_price = float(purchase_price)
            if amount <= 0 or purchase_price <= 0:
                return jsonify({'error': 'Amount and purchase_price must be positive'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Amount and purchase_price must be valid numbers'}), 400

        # Get user points
        user_points = get_user_points(user_id)
        if user_points is None:
            return jsonify({'error': 'Invalid user_id'}), 404

        # Calculate the cost in points (amount * purchase_price * POINTS_PER_DOLLAR)
        cost_in_points = amount * purchase_price * POINTS_PER_DOLLAR

        # Check if the user has enough points
        if user_points < cost_in_points:
            return jsonify({'error': f'Insufficient points. Required: {cost_in_points}, Available: {user_points}'}), 400

        # Deduct points from the user
        new_points = user_points - cost_in_points
        update_user_points(user_id, new_points)

        # Check if the user already has this coin in their portfolio
        existing_entry = get_portfolio_entry(user_id, coin_id)

        if existing_entry:
            # Update the existing entry
            portfolio_id, current_amount, current_purchase_price = existing_entry
            new_amount = current_amount + amount
            # Calculate the new average purchase price
            total_value = (current_amount * current_purchase_price) + (amount * purchase_price)
            new_purchase_price = total_value / new_amount

            update_query = f"""
            ALTER TABLE {DATABASE}.portfolio 
            UPDATE amount = %(new_amount)s, purchase_price = %(new_purchase_price)s 
            WHERE portfolio_id = %(portfolio_id)s
            """
            execute_clickhouse_query(update_query, params={
                "new_amount": new_amount,
                "new_purchase_price": new_purchase_price,
                "portfolio_id": portfolio_id
            })
        else:
            # Insert a new portfolio entry
            portfolio_id = str(uuid.uuid4())
            added_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

            insert_query = f"""
            INSERT INTO {DATABASE}.portfolio (portfolio_id, user_id, coin_id, amount, purchase_price, added_at)
            VALUES (%(portfolio_id)s, %(user_id)s, %(coin_id)s, %(amount)s, %(purchase_price)s, %(added_at)s)
            """
            execute_clickhouse_query(insert_query, params={
                "portfolio_id": portfolio_id,
                "user_id": user_id,
                "coin_id": coin_id,
                "amount": amount,
                "purchase_price": purchase_price,
                "added_at": added_at
            })

        # Log the BUY transaction
        log_transaction(user_id, coin_id, 'buy', amount, purchase_price)

        return jsonify({
            'message': 'Coin added to portfolio successfully',
            'portfolio_id': portfolio_id,
            'remaining_points': new_points
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get the user's portfolio
@portfolio_bp.route('/', methods=['GET'])
def get_portfolio():
    try:
        user_id = request.args.get('user_id')
        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404

        # # Validate user_id
        # if get_user_points(user_id) is None:
        #     return jsonify({'error': 'Invalid user_id'}), 404

        # Fetch portfolio entries with coin details
        query = f"""
        SELECT p.portfolio_id, p.user_id, p.coin_id, c.name, c.symbol, c.image_url, 
               p.amount, p.purchase_price, p.added_at
        FROM {DATABASE}.portfolio p
        LEFT JOIN {DATABASE}.coins c ON p.coin_id = c.coin_id
        WHERE p.user_id = %(user_id)s
        """
        result = execute_clickhouse_query(query, params={"user_id": user_id})

        # Format the response
        portfolio = [
            {
                'portfolio_id': row['portfolio_id'],
                'user_id': row['user_id'],
                'coin_id': row['coin_id'],
                'coin_name': row['name'],
                'coin_symbol': row['symbol'],
                'coin_image_url': row['image_url'],
                'amount': float(row['amount']),
                'purchase_price': float(row['purchase_price']),
                'added_at': row['added_at']  # Already a string in the format 'YYYY-MM-DD HH:MM:SS'
            }
            for row in result.get('data', [])
        ]

        return jsonify({'portfolio': portfolio}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Sell a specified amount of coins from the user's portfolio
@portfolio_bp.route('/sell/<portfolio_id>', methods=['POST'])
@jwt_required()
def sell_from_portfolio(portfolio_id):
    try:
        user_id = get_jwt_identity()
        # Validate user_id
        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404
        data = request.get_json()
        sell_amount = data.get('sell_amount')
        sell_price = data.get('sell_price')

        # Validate required fields
        if not all([user_id, sell_amount, sell_price]):
            return jsonify({'error': 'Missing required fields (user_id, sell_amount, sell_price)'}), 400

        # Get user points
        user_points = get_user_points(user_id)
        if user_points is None:
            return jsonify({'error': 'Invalid user_id'}), 404

        # Check if the portfolio entry exists and belongs to the user
        query = f"""
        SELECT coin_id, amount, purchase_price 
        FROM {DATABASE}.portfolio 
        WHERE portfolio_id = %(portfolio_id)s AND user_id = %(user_id)s
        """
        result = execute_clickhouse_query(query, params={"portfolio_id": portfolio_id, "user_id": user_id})

        rows = result.get('data', [])
        if not rows:
            return jsonify({'error': 'Portfolio entry not found or does not belong to this user'}), 404

        row = rows[0]
        coin_id = row['coin_id']
        current_amount = float(row['amount'])
        purchase_price = float(row['purchase_price'])

        # Validate sell_amount and sell_price
        try:
            sell_amount = float(sell_amount)
            sell_price = float(sell_price)
            if sell_amount <= 0:
                return jsonify({'error': 'Sell amount must be positive'}), 400
            if sell_amount > current_amount:
                return jsonify({'error': f'Sell amount exceeds current amount. Available: {current_amount}'}), 400
            if sell_price <= 0:
                return jsonify({'error': 'Sell price must be positive'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Sell amount and sell price must be valid numbers'}), 400

        # Calculate proceeds from the sale (sell_amount * sell_price * POINTS_PER_DOLLAR)
        proceeds = sell_amount * sell_price * POINTS_PER_DOLLAR

        # Optional: Calculate profit/loss for informational purposes
        cost_basis = sell_amount * purchase_price * POINTS_PER_DOLLAR
        profit_loss = proceeds - cost_basis

        # Update user points with the proceeds from the sale
        new_points = user_points + proceeds
        update_user_points(user_id, new_points)

        # Update or delete the portfolio entry
        new_amount = current_amount - sell_amount
        if new_amount <= 0:
            # Delete the portfolio entry if the amount becomes 0
            delete_query = f"""
            ALTER TABLE {DATABASE}.portfolio 
            DELETE WHERE portfolio_id = %(portfolio_id)s AND user_id = %(user_id)s
            """
            execute_clickhouse_query(delete_query, params={"portfolio_id": portfolio_id, "user_id": user_id})
            message = 'Coins sold and portfolio entry removed successfully'
        else:
            # Update the amount in the portfolio
            update_query = f"""
            ALTER TABLE {DATABASE}.portfolio 
            UPDATE amount = %(new_amount)s 
            WHERE portfolio_id = %(portfolio_id)s AND user_id = %(user_id)s
            """
            execute_clickhouse_query(update_query, params={
                "new_amount": new_amount,
                "portfolio_id": portfolio_id,
                "user_id": user_id
            })
            message = 'Coins sold successfully'

        # Log the SELL transaction
        log_transaction(user_id, coin_id, 'sell', sell_amount, sell_price)

        return jsonify({
            'message': message,
            'new_amount': new_amount if new_amount > 0 else 0,
            'proceeds': proceeds,
            'profit_loss': profit_loss,
            'new_points': new_points
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500