from flask import Flask, jsonify, Blueprint, Response, request
from flask_cors import CORS  # Added for CORS support
from api.auth import auth_bp  # Import the auth blueprint
from api.portfolio import portfolio_bp
from api.transactions import transactions_bp
from api.favorites import favorites_bp
from api.historical_data import historical_data_bp
from api.coindetail import coindetail_bp
from api.chatbot import chatbot_bp
from api.news import news_bp
from api.coins import coins_bp
from api.clickhouse_config import init_app  # Import ClickHouse client management

from kafka import KafkaConsumer
import json
from collections import defaultdict
from threading import Thread
from flask_socketio import SocketIO
import logging

from flask_jwt_extended import JWTManager
from datetime import timedelta

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins="*")
app.config["JWT_SECRET_KEY"] = "abcdefghklmnopq123456"  # Change this in production!
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token"
app.config["JWT_REFRESH_COOKIE_NAME"] = "refresh_token"
app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # Enable in production
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=30)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

jwt = JWTManager(app)

# Register blueprints (API modules)
app.register_blueprint(auth_bp, url_prefix='/auth')  # Routes for authentication (e.g., /auth/register)
app.register_blueprint(portfolio_bp, url_prefix='/portfolio')  # Routes for portfolio (e.g., /portfolio/add)
app.register_blueprint(transactions_bp, url_prefix='/transactions')
app.register_blueprint(favorites_bp, url_prefix='/favorites')
app.register_blueprint(historical_data_bp, url_prefix='/historical_data')
app.register_blueprint(news_bp, url_prefix='/news')
app.register_blueprint(coins_bp, url_prefix='/coins')
app.register_blueprint(coindetail_bp, url_prefix='/coindetail')
app.register_blueprint(chatbot_bp, url_prefix='/chatbot')

# Initialize ClickHouse client management
init_app(app)

# Optional: Add a root route to verify the server is running
@app.route('/')
def home():
    return {"message": "Welcome to BlockTrade Track API"}, 200

def process_kafka_messages():
    for message in consumer:
        coin_data = message.value
        updated_data = {}

        for coin_symbol, data in coin_data.items():
            close_price = data['close_price']
            open_price = data['open_price']
            high_price = data['high_price']
            low_price = data['low_price']
            volume = data['volume']
            timestamp = data['timestamp']

            candle = {
                "timestamp": timestamp,
                "open": open_price,
                "high": high_price,
                "low": low_price,
                "close": close_price,
                "volume": volume
            }

            realtime_data[coin_symbol].append(candle)
            if len(realtime_data[coin_symbol]) > 50:
                realtime_data[coin_symbol].pop(0)

            updated_data[coin_symbol] = realtime_data[coin_symbol]  # Gửi dữ liệu nến mới nhất

        # Gửi dữ liệu realtime đến tất cả client
        socketio.emit('data_update', updated_data)

realtime_data_bp = Blueprint('realtime_data', __name__)

@realtime_data_bp.route('', methods=['GET'])
def get_realtime_data():
    # (Example: /realtime?coin_symbol=BTCUSDT)
    coin_symbol = request.args.get('coin_symbol').upper()
    # print(data)
    if coin_symbol in realtime_data:
        return jsonify(realtime_data[coin_symbol])
    else:
        return jsonify({"error": "No data for this symbol"}), 404
app.register_blueprint(realtime_data_bp, url_prefix='/realtime_data')

if __name__ == '__main__':
    socketio = SocketIO(app, cors_allowed_origins="*")  # Bật CORS cho React
    consumer = KafkaConsumer(
        'realtime_coin',
        bootstrap_servers='localhost:9092',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    realtime_data = defaultdict(list)
    consumer_thread = Thread(target=process_kafka_messages)
    consumer_thread.daemon = True
    consumer_thread.start()

    socketio.run(app, host='0.0.0.0', port=5000, debug=True)