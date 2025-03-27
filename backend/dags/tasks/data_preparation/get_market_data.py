from datetime import datetime, timedelta
import pandas as pd
import clickhouse_connect 
import json 
from binance.client import Client
import requests 
import time 
import numpy as np




def create_df_from_bi_api(start_date, end_date, clickhouse_client, client):
    coin_data = clickhouse_client.query("SELECT coin_id, name, symbol FROM blocktrade_track.coins")
    coin_data = [(str(x[0]), x[1], x[2]) for x in coin_data.result_rows]

    # Tạo DataFrame rỗng với các cột theo định dạng Binance
    columns = [
        "Timestamp", "Open", "High", "Low", "Close", "Volume",
        "Close time", "Quote asset volume", "Number of trades",
        "Taker buy base asset volume", "Taker buy quote asset volume",
        "Ignore", "Coin ID", "Symbol"
    ]
    df = pd.DataFrame(columns=columns)
    # Xác định khoảng thời gian lấy dữ liệu (365 ngày trước ngày 2025-03-24)
    interval = Client.KLINE_INTERVAL_1DAY  # Khung thời gian 1 ngày
    for coin in coin_data:
        data = [coin[0], coin[2]]
        klines = client.get_historical_klines(data[1], interval, start_date, end_date)
        klines = list(map(lambda x: x + list((data[0], data[1])), klines))
        if len(klines) == 0 and len(clickhouse_client.query(f"SELECT * FROM blocktrade_track.coins a join blocktrade_track.market_data b on a.coin_id = b.coin_id WHERE a.symbol = '{data[1]}'").result_rows) == 0:
            clickhouse_client.query(f"DELETE FROM blocktrade_track.coins WHERE symbol = '{data[1]}'")

        # Chuyển klines thành DataFrame tạm thời
        temp_df = pd.DataFrame(klines, columns=columns)
        temp_df["Timestamp"] = pd.to_datetime(temp_df["Timestamp"], unit="ms")
        # print(temp_df)

        # Nối DataFrame mới vào DataFrame chính
        df = pd.concat([df, temp_df], ignore_index=True)
    return df

def create_df_from_onl_api(start_date, end_date):
    with open(r'/opt/airflow/dags/tasks/data_preparation/coin_id.json', 'r') as f:
        data = json.load(f) 


    columns = ['Timestamp', 'Market_cap', 'Symbol']
    df = pd.DataFrame(columns=columns)

    for d in data:
        try:
            id = d['id']
            url = f'https://api.coingecko.com/api/v3/coins/{id}/market_chart/range?vs_currency=usd&from={start_date}&to={end_date}'

            response = requests.get(url)
            data = list(x+list((d['symbol'].upper() + 'USDT', )) for x in response.json()["market_caps"])
            temp_df = pd.DataFrame(data=data, columns=columns)
            temp_df["Timestamp"] = pd.to_datetime(temp_df["Timestamp"], unit="ms")
            temp_df = temp_df.loc[temp_df.groupby(temp_df["Timestamp"].dt.floor("D"))["Timestamp"].idxmax()]
            temp_df["Timestamp"] = temp_df["Timestamp"].dt.normalize()
            df = pd.concat([df, temp_df], ignore_index=True)
            time.sleep(15)
        except Exception as e:
            print(d)
            break
    return df


def full_load(clickhouse_client, client):
    df1_start_date = (datetime.now() - timedelta(days=364)).strftime("%Y-%m-%d")
    df1_end_date = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")
    df1 = create_df_from_bi_api(df1_start_date, df1_end_date, clickhouse_client, client)

    df2_start_date = datetime.timestamp(datetime.strptime((datetime.now().date() - timedelta(days=364)).strftime('%Y-%m-%d'), '%Y-%m-%d'))
    df2_end_date = datetime.timestamp(datetime.strptime((datetime.now().date() - timedelta(days=5)).strftime('%Y-%m-%d'), '%Y-%m-%d'))
    df2 = create_df_from_onl_api(df2_start_date, df2_end_date)

    df = pd.merge(df1, df2, on=['Symbol', 'Timestamp'], how='inner')
    df = df.sort_values(by=['Coin ID', 'Timestamp'])
    df['Market_cap'] = df['Market_cap'].astype(float)
    df['Close'] = df['Close'].astype(float) 

    # Tính price_change_24h: (Close hôm nay - Close hôm qua) / Close hôm qua
    df['price_change_24h'] = df.groupby('Coin ID')['Close'].pct_change() * 100  # Tính phần trăm thay đổi
    df['price_change_24h'] = df['price_change_24h'].fillna(0) 
    df['circulating_supply'] = df['Market_cap'] / df['Close'].replace(0, np.nan)
    df['circulating_supply'] = df['circulating_supply'].fillna(0)

    df = df[['Coin ID', 'Close', 'Market_cap', 'Volume', 'price_change_24h', 'circulating_supply', 'Timestamp']]
    data = list(df.itertuples(index=False, name=None))
    clickhouse_client.insert(table='blocktrade_track.market_data', data=data, column_names=['coin_id', 'price', 'market_cap', 'volume_24h', 'price_change_24h', 'circulating_supply','updated_date']) 

def incremental_load(clickhouse_client, client):
    coin_data = clickhouse_client.query("SELECT coin_id, symbol, name FROM blocktrade_track.coins").result_rows
    for coin in coin_data:
        max_time = clickhouse_client.query(f"SELECT max(updated_date) FROM blocktrade_track.market_data WHERE coin_id = '{coin[0]}'").result_rows[0][0]
        df1_start_date = (max_time + timedelta(days=1)).strftime("%Y-%m-%d")
        df1_end_date = ((datetime.now()).strftime("%Y-%m-%d"))
        print('df1 start date:', df1_start_date, 'df1 end date:', df1_end_date)
        # Tạo DataFrame rỗng với các cột theo định dạng Binance
        df1_columns = [
            "Timestamp", "Open", "High", "Low", "Close", "Volume",
            "Close time", "Quote asset volume", "Number of trades",
            "Taker buy base asset volume", "Taker buy quote asset volume",
            "Ignore", "Coin ID", "Symbol"
        ]
        # Xác định khoảng thời gian lấy dữ liệu (365 ngày trước ngày 2025-03-24)
        interval = Client.KLINE_INTERVAL_1DAY  # Khung thời gian 1 ngày
        data = [coin[0], coin[2]]
        klines = client.get_historical_klines(coin[1], interval, df1_start_date, df1_end_date)
        klines = list(map(lambda x: x + list((coin[0], coin[1])), klines))
        if len(klines) == 0 and len(clickhouse_client.query(f"SELECT * FROM blocktrade_track.coins a join blocktrade_track.market_data b on a.coin_id = b.coin_id WHERE a.symbol = '{coin[1]}'").result_rows) == 0:
            clickhouse_client.query(f"DELETE FROM blocktrade_track.coins WHERE symbol = '{coin[1]}'")

        # Chuyển klines thành DataFrame tạm thời
        df1 = pd.DataFrame(klines, columns=df1_columns)
        df1["Timestamp"] = pd.to_datetime(df1["Timestamp"], unit="ms")
        print(df1.head())
        # print(df1.info())
        df2_start_date = int(datetime.timestamp(datetime.strptime((max_time.date() + timedelta(days=1)).strftime('%Y-%m-%d'), '%Y-%m-%d')))
        df2_end_date = int(datetime.timestamp(datetime.strptime((datetime.now()).strftime('%Y-%m-%d'), '%Y-%m-%d')))
        print('df2 start date:', datetime.fromtimestamp(df2_start_date), 'df2 end date:', datetime.fromtimestamp(df2_end_date))
        with open(r'/opt/airflow/dags/tasks/data_preparation/coin_id.json', 'r') as f:
            data = json.load(f) 
        df2_columns = ['Timestamp', 'Market_cap', 'Symbol']
        df2 = pd.DataFrame(columns=df2_columns)
        for d in data:
            if d['name'].lower() == coin[2].lower() and d['symbol'].lower() == coin[1][0:-4].lower():
                try:
                    id = d['id']
                    url = f'https://api.coingecko.com/api/v3/coins/{id}/market_chart/range?vs_currency=usd&from={df2_start_date}&to={df2_end_date}'

                    response = requests.get(url)
                    da = list(x+list((d['symbol'].upper() + 'USDT', )) for x in response.json()["market_caps"])
                    temp_df2 = pd.DataFrame(data=da, columns=df2_columns)
                    temp_df2["Timestamp"] = pd.to_datetime(temp_df2["Timestamp"], unit="ms")
                    df2 = temp_df2.loc[temp_df2.groupby(temp_df2["Timestamp"].dt.floor("D"))["Timestamp"].idxmax()]
                    df2["Timestamp"] = df2["Timestamp"].dt.normalize()
                    print(df2.head())
                    break
                except Exception as e:
                    print(d, e)
                    break
        # print(df2.head())
        # print(df2.info())
        df = pd.merge(df1, df2, on=['Symbol', 'Timestamp'], how='inner')
        df = df.sort_values(by=['Coin ID', 'Timestamp'])
        df['Market_cap'] = df['Market_cap'].astype(float)
        df['Close'] = df['Close'].astype(float) 
        # Tính price_change_24h: (Close hôm nay - Close hôm qua) / Close hôm qua
        df['price_change_24h'] = df.groupby('Coin ID')['Close'].pct_change() * 100  # Tính phần trăm thay đổi
        df['price_change_24h'] = df['price_change_24h'].fillna(0) 
        df['circulating_supply'] = df['Market_cap'] / df['Close'].replace(0, np.nan)
        df['circulating_supply'] = df['circulating_supply'].fillna(0)

        df = df[['Coin ID', 'Close', 'Market_cap', 'Volume', 'price_change_24h', 'circulating_supply', 'Timestamp']]
        data = list(df.itertuples(index=False, name=None))
        # print(data)
        clickhouse_client.insert(table='blocktrade_track.market_data', data=data, column_names=['coin_id', 'price', 'market_cap', 'volume_24h', 'price_change_24h', 'circulating_supply','updated_date']) 
        print(data)
        time.sleep(15)



if __name__ == "__main__":
    clickhouse_client = clickhouse_connect.get_client(
        host='host.docker.internal',
        username='default',
        password='',
        port='8124'
    )
    client = Client()
    # full_load()
    incremental_load(clickhouse_client, client)
    # Sắp xếp dữ liệu theo 'Coin ID' và 'Timestamp' để đảm bảo tính toán chính xác
    
# print(df.head())
# print(df)
# df.to_csv('temp.csv', index=False)




