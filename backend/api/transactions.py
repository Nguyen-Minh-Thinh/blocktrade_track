from flask import Blueprint, request, jsonify
import pytz
from datetime import datetime, timedelta
from .portfolio import execute_clickhouse_query  # Nhập hàm từ portfolio.py

# Initialize the Blueprint for transaction routes
transactions_bp = Blueprint('transactions', __name__)

# ClickHouse Configuration
DATABASE = "blocktrade_track"

# Helper function to validate user_id
def validate_user(user_id):
    query = f"SELECT * FROM {DATABASE}.users WHERE user_id = %(user_id)s"
    result = execute_clickhouse_query(query, params={"user_id": user_id})
    return bool(result.get('data', []))

# Get the user's transaction history
@transactions_bp.route('/', methods=['GET'])
def get_transactions():
    try:
        user_id = request.args.get('user_id')
        start_date = request.args.get('start_date')  # Format: YYYY-MM-DD
        end_date = request.args.get('end_date')      # Format: YYYY-MM-DD

        if not user_id:
            return jsonify({'error': 'Missing user_id parameter'}), 400

        if not validate_user(user_id):
            return jsonify({'error': 'Invalid user_id'}), 404

        # Default to last 30 days if no date range is provided
        vietnam_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        if not end_date:
            end_date = datetime.now(vietnam_tz).strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now(vietnam_tz) - timedelta(days=30)).strftime('%Y-%m-%d')

        # Fetch transactions with coin details
        query = f"""
        SELECT t.transaction_id, t.user_id, t.coin_id, c.name, c.symbol, c.image_url,
               t.type, t.amount, t.price, t.points_spent, t.trans_date
        FROM {DATABASE}.transactions t
        LEFT JOIN {DATABASE}.coins c ON t.coin_id = c.coin_id
        WHERE t.user_id = %(user_id)s
        AND t.trans_date >= %(start_date)s
        AND t.trans_date <= %(end_date)s
        ORDER BY t.trans_date DESC
        """
        result = execute_clickhouse_query(query, params={
            "user_id": user_id,
            "start_date": start_date,
            "end_date": end_date + ' 23:59:59'  # Include the whole end date
        })

        transactions = [
            {
                'transaction_id': row['transaction_id'],
                'user_id': row['user_id'],
                'coin_id': row['coin_id'],
                'coin_name': row['name'],
                'coin_symbol': row['symbol'],
                'coin_image_url': row['image_url'],
                'type': row['type'],
                'amount': float(row['amount']),
                'price': float(row['price']),
                'points_spent': float(row['points_spent']),
                'trans_date': row['trans_date']
            }
            for row in result.get('data', [])
        ]

        return jsonify({'transactions': transactions}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500