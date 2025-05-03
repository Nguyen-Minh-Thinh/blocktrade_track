import time
from datetime import datetime, timedelta
from binance.client import Client
from kafka import KafkaProducer
import json
import clickhouse_connect

# Khởi tạo client Binance
api_key = 'your_api_key'  # Chú ý điền đúng API key
api_secret = 'your_api_secret'  # Chú ý điền đúng API secret
client = Client(api_key, api_secret)

# Kết nối với Clickhouse
clickhouse_client = clickhouse_connect.get_client(
    host='localhost',
    port='8124',
    username='default',
    password='123456',
    database='blocktrade_track'
)

# Lấy danh sách các đồng coin từ cơ sở dữ liệu Clickhouse
SYMBOLS = [val[0] for val in clickhouse_client.query('SELECT symbol FROM coins').result_rows]

# Khởi tạo Kafka producer
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

# Hàm lấy dữ liệu lịch sử từ Binance
def get_historical_data(symbol, interval, start_str, end_str):
    # Lấy dữ liệu lịch sử từ Binance với khoảng thời gian là 'start_str' đến 'end_str'
    klines = client.get_historical_klines(symbol, interval, start_str, end_str)
    return klines

# Hàm xử lý và gửi dữ liệu vào Kafka
def process_and_send_data(klines, symbol):
    for kline in klines:
        open_time = datetime.fromtimestamp(kline[0] / 1000)  # Chuyển timestamp từ milliseconds sang seconds
        open_price = float(kline[1])
        high_price = float(kline[2])
        low_price = float(kline[3])
        close_price = float(kline[4])
        volume = float(kline[5])
        
        # Chuyển thành dict để gửi vào Kafka
        data = {
            'symbol': symbol.upper(),
            'open_time': open_time.strftime('%Y-%m-%d %H:%M:%S'),
            'open_price': open_price,
            'high_price': high_price,
            'low_price': low_price,
            'close_price': close_price,
            'volume': volume
        }
        producer.send('realtime_coin', data)  # Gửi dữ liệu vào Kafka

# Hàm lấy dữ liệu cho các đồng coin mỗi 5 phút
def get_data_for_next_5_minutes(count):
    while True:
        # if count == 0:
        #     end_time = datetime.now()
        #     start_time = end_time - timedelta(days=1)
        # else:
        #     # Tính toán thời gian bắt đầu và kết thúc (5 phút trước và 5 phút sau)
        end_time = datetime.now()
        start_time = end_time - timedelta(days=1)
        
        # Chuyển thời gian về định dạng phù hợp
        start_str = start_time.strftime('%d %b, %Y %H:%M:%S')
        end_str = end_time.strftime('%d %b, %Y %H:%M:%S')

        # Lấy dữ liệu cho mỗi đồng coin
        for symbol in SYMBOLS:
            klines = get_historical_data(symbol, Client.KLINE_INTERVAL_5MINUTE, start_str, end_str)
            print(klines)
            process_and_send_data(klines, symbol)

        print(f"✅ Dữ liệu đã được lấy và gửi vào Kafka cho {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Chờ 5 phút trước khi lấy dữ liệu tiếp
        count += 1
        time.sleep(360)  # 5 phút = 300 giây

# Chạy chương trình để lấy dữ liệu mỗi 5 phút
if __name__ == "__main__":
    get_data_for_next_5_minutes(0)  # Lấy dữ liệu và chờ 5 phút để lấy tiếp
