import time
from datetime import datetime
from binance import ThreadedWebsocketManager
from threading import Event
from kafka import KafkaProducer
import json

# List of coin id
SYMBOLS = [
    "btcusdt", "ethusdt", "bnbusdt", "xrpusdt", "adausdt",
    "dogeusdt", "solusdt", "dotusdt", "maticusdt", "ltcusdt",
    "shibusdt", "avaxusdt", "trxusdt", "linkusdt", "xlmusdt",
    "uniusdt", "atomusdt", "vetusdt", "nearusdt", "filusdt"
]

producer = KafkaProducer(
    bootstrap_servers = 'localhost:9092',
    value_serializer = lambda v: json.dumps(v).encode("utf-8")
)

# Function to process data from API
def handle_message(msg):
    symbol = msg["s"].upper()  # ID of coins (BTCUSDT)  
    close_price = float(msg["c"])  # Price of coins at present
    open_price = float(msg["o"])  # Price of coins at 24 hours ago
    high_price = float(msg["h"])  # Highest price in the last 24 hours
    low_price = float(msg["l"])  # Lowest price in the last 24 hours
    volume = float(msg["v"])  # Total trading volume in the last 24 hours
    # dt_obj = datetime.fromtimestamp(msg['E']/1000).strftime("%Y-%m-%d %H:%M:%S")  # Cần chuyển timestamp về dạng seconds, Binance trả về milliseconds
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    temp_dict = {
        symbol: {
            'close_price': close_price,
            'open_price': open_price,
            'high_price': high_price,
            'low_price': low_price,
            'volume': volume,
            'timestamp': timestamp
        }
    }

    producer.send('realtime_coin', temp_dict)  # Convert dict type to string

# Initialize WebSocket Binance
twm = ThreadedWebsocketManager()
twm.start()

# Subscribe WebSocket to get Mini Ticker for each coin
for symbol in SYMBOLS:
    twm.start_symbol_miniticker_socket(callback=handle_message, symbol=symbol)

# Keep the program running constantly
stop_event = Event()
try:
    while not stop_event.is_set():
        time.sleep(1)  # Avoid overwhelming the CPU
except KeyboardInterrupt:
    print("\n⏳ Stopping WebSocket...")
    twm.stop()
    print("✅ WebSocket stopped.")

