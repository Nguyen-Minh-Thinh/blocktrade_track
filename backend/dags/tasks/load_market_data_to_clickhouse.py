from data_preparation.get_market_data import full_load, incremental_load
from binance.client import Client
import clickhouse_connect 

clickhouse_client = clickhouse_connect.get_client(
    host='host.docker.internal',
    port='8124',
    username='default',
    password=''
)

client = Client()


market_data = clickhouse_client.query('SELECT * FROM blocktrade_track.market_data').result_rows
if len(market_data) == 0:
    full_load(clickhouse_client, client)
else:
    incremental_load(clickhouse_client, client)

