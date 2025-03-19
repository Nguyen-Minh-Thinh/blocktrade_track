CREATE DATABASE IF NOT EXISTS blocktrade_track;
CREATE TABLE IF NOT EXISTS blocktrade_track.users (
    user_id UUID DEFAULT generateUUIDv4(),
    name String,
    email String,
    image_url String,
    username String,
    password_hash String,
    created_at DateTime DEFAULT now(),
    points Decimal64(2)
) ENGINE = MergeTree()
ORDER BY user_id;

CREATE TABLE IF NOT EXISTS blocktrade_track.coins (
    coin_id UUID DEFAULT generateUUIDv4(),
    name String,
    symbol String,
    image_url String,
    total_supply Decimal128(10), 
    circulating_supply Decimal128(10)
) ENGINE = MergeTree()
ORDER BY coin_id;

CREATE TABLE IF NOT EXISTS blocktrade_track.favorites (
    favorite_id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    coin_id UUID,
    added_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY favorite_id;

CREATE TABLE IF NOT EXISTS blocktrade_track.market_data (
    market_id UUID DEFAULT generateUUIDv4(),
    coin_id UUID,
    price Decimal128(10),
    market_cap Decimal128(10),
    volume_24h Decimal128(10),
    price_change_24h Decimal32(3),
    updated_date DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY market_id;

CREATE TABLE IF NOT EXISTS blocktrade_track.portfolio (
    portfolio_id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    coin_id UUID,
    amount Decimal128(10),
    purchase_price Decimal128(10),
    added_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY portfolio_id;

CREATE TABLE IF NOT EXISTS blocktrade_track.transactions (
    transaction_id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    coin_id UUID,
    type Enum('buy' = 1, 'sell' = 2, 'swap' = 3),  
    amount Decimal128(10),
    price Decimal128(10),
    points_spent Decimal128(10),
    trans_date DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY transaction_id;
