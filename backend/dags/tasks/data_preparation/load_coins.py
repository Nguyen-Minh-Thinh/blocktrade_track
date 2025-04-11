import clickhouse_connect
import pandas as pd
from binance.client import Client
import json 

clickhouse_client = clickhouse_connect.get_client(
    host='host.docker.internal',
    username='default',
    password='123456',
    port='8124'
)
check = clickhouse_client.query('SELECT * FROM blocktrade_track.coins').result_rows
if len(check) == 0:
    df = pd.read_csv(r'/opt/airflow/dags/tasks/data_preparation/coin_data.csv', usecols=['name', 'symbol', 'image_url']).head(70)
    df['symbol'] = df['symbol'] + 'USDT'

    data = list(df.itertuples(index=False, name=None))
    clickhouse_client.command("TRUNCATE TABLE IF EXISTS blocktrade_track.coins")
    clickhouse_client.insert('blocktrade_track.coins', data=data, column_names=['name', 'symbol', 'image_url'])


    # Không cần API key để lấy dữ liệu lịch sử
    client = Client()
    # Lấy thông tin các cặp giao dịch trên Binance
    exchange_info = client.get_exchange_info()

    # Lấy danh sách tất cả symbol
    symbols = [s["symbol"] for s in exchange_info["symbols"]]

    coin_data = clickhouse_client.query("SELECT symbol FROM blocktrade_track.coins").result_rows
    for coin in coin_data:
        if coin[0] not in symbols:
            clickhouse_client.command(f"DELETE FROM blocktrade_track.coins WHERE symbol = '{coin[0]}'")
