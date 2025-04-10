import requests 
import json 
import clickhouse_connect

url = 'https://api.coingecko.com/api/v3/coins/list'
response = requests.get(url)
data = response.json()
client = clickhouse_connect.get_client(
    host='host.docker.internal',
    username='default',
    password='123456',
    port='8124'
)

coin_data = client.query("SELECT name, symbol FROM blocktrade_track.coins")

coinid_data = []
flag = False
for coin in coin_data.result_rows:
    for d in data:
        if d['name'].lower() == coin[0].lower() and d['symbol'].lower() == coin[1][0:-4].lower():
            d['id'] = d['id'].lower()
            coinid_data.append(d)
            flag = True 
            break
    if flag == False:
        client.query(f"DELETE FROM blocktrade_track.coins WHERE symbol = '{coin[1]}'")
    flag = False
# print(coinid_data)
# print(coin_data.result_rows, type(coin_data))

with open("coin_id.json", "w", encoding="utf-8") as f:
    json.dump(coinid_data, f, ensure_ascii=False, indent=4)  



