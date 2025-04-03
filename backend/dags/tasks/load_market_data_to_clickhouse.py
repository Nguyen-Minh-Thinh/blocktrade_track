from data_preparation.get_market_data import full_load, incremental_load
from binance.client import Client
import clickhouse_connect 
from confluent_kafka import Producer
import json 

clickhouse_client = clickhouse_connect.get_client(
    host='host.docker.internal',
    port='8124',
    username='default',
    password=''
)

client = Client()

kafka_producer = Producer(
    {
        'bootstrap.servers': 'kafka:29092',
        'acks': 'all',  # Đảm bảo dữ liệu đã được ghi vào tất cả replica
        'retries': 5,   # Số lần thử lại khi gặp lỗi
        'enable.idempotence': True  # Kích hoạt chế độ idempotent
    }
)

market_data = clickhouse_client.query('SELECT * FROM blocktrade_track.market_data').result_rows
if len(market_data) == 0:
    full_load(clickhouse_client, client, kafka_producer)
else:
    incremental_load(clickhouse_client, client, kafka_producer)

