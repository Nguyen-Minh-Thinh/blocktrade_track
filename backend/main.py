from flask import Flask, jsonify, Blueprint, request
from flask_cors import CORS
from flask_socketio import SocketIO
from kafka import KafkaConsumer
import json
from collections import defaultdict
from threading import Thread
import logging
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

from flask_jwt_extended import JWTManager
from datetime import timedelta

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the Flask app
app = Flask(__name__)
app.secret_key = 'abcdefgh123456'
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
# app.register_blueprint(chatbot_bp, url_prefix='/chatbot')

# Initialize ClickHouse client management
init_app(app)

# SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variable to hold real-time data
realtime_data = defaultdict(list)

# Kafka consumer thread function
def process_kafka_messages():
    consumer = KafkaConsumer(
        'realtime_coin',
        bootstrap_servers='localhost:9092',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    for message in consumer:
        coin_data = message.value
        
        # Log the incoming message to check the structure
        # logger.info(f"Received message: {coin_data}")
        
        updated_data = {}
        
        # Assuming coin_data is a dictionary like {'symbol': 'ALGOUSDT', ...}
        if isinstance(coin_data, dict):
            coin_symbol = coin_data.get('symbol')
            if coin_symbol:
                close_price = coin_data.get('close_price')
                open_price = coin_data.get('open_price')
                high_price = coin_data.get('high_price')
                low_price = coin_data.get('low_price')
                volume = coin_data.get('volume')
                timestamp = coin_data.get('open_time')  # We use 'open_time' as timestamp

                # Creating a new candle data structure
                candle = {
                    "timestamp": timestamp,
                    "open": open_price,
                    "high": high_price,
                    "low": low_price,
                    "close": close_price,
                    "volume": volume
                }

                # Ensure realtime_data is updated correctly
                realtime_data[coin_symbol].append(candle)
                if len(realtime_data[coin_symbol]) > 200:
                    realtime_data[coin_symbol].pop(0)

                updated_data[coin_symbol] = realtime_data[coin_symbol]
            else:
                logger.error("No 'symbol' found in the message")

        else:
            logger.error(f"Expected data to be a dictionary, but got: {type(coin_data)}")

        # Emit updated data to all connected clients via SocketIO
        socketio.emit('data_update', updated_data)


# Realtime data API route
realtime_data_bp = Blueprint('realtime_data', __name__)

@realtime_data_bp.route('', methods=['GET'])
def get_realtime_data():
    coin_symbol = request.args.get('coin_symbol').upper()
    if coin_symbol in realtime_data:
        return jsonify(realtime_data[coin_symbol])
    else:
        return jsonify({"error": "No data for this symbol"}), 404

app.register_blueprint(realtime_data_bp, url_prefix='/realtime_data')

# Start Kafka consumer in a separate thread
def start_kafka_thread():
    kafka_thread = Thread(target=process_kafka_messages)
    kafka_thread.daemon = True  # Ensures the thread will exit when the main program exits
    kafka_thread.start()

if __name__ == '__main__':
    start_kafka_thread()  # Start Kafka consumer thread
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
