import clickhouse_connect


client = clickhouse_connect.get_client(
    host='host.docker.internal',
    port='8124',
    username='default',
    password='123456'
)

# Create database blocktrade_track
client.command('''CREATE DATABASE IF NOT EXISTS blocktrade_track''')

# Create table coins
client.command('''CREATE TABLE IF NOT EXISTS blocktrade_track.coins (
                    coin_id UUID DEFAULT generateUUIDv4(),
                    name String,
                    symbol String,
                    image_url String
                ) ENGINE = MergeTree()
                ORDER BY coin_id
                ''')

# Create table market_data
client.command('''CREATE TABLE IF NOT EXISTS blocktrade_track.market_data (
                    market_id UUID DEFAULT generateUUIDv4(),
                    coin_id UUID,
                    price Decimal128(10),
                    market_cap Decimal128(10),
                    volume_24h Decimal128(10),
                    price_change_24h Decimal32(3),
                    circulating_supply Decimal128(10),
                    updated_date DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY market_id
                ''')