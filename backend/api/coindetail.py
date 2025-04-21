from flask import Blueprint, jsonify, request
from flask_cors import CORS
import logging
import aiohttp
import asyncio
import requests
from binance.client import Client  # Import python-binance library
from .clickhouse_config import execute_clickhouse_query, DATABASE  # Import from clickhouse_config.py

# Initialize the Blueprint for coindetail routes
coindetail_bp = Blueprint('coindetail', __name__)
CORS(coindetail_bp, supports_credentials=True, origins="*")

# Set up logging
logger = logging.getLogger(__name__)

# Timeout configuration for HTTP requests
TIMEOUT = 5  # 5 seconds timeout for each API request

# CoinGecko API Key
COINGECKO_API_KEY = "CG-AVaf2fBWa8LYL32SEeK2CC4g"

# Headers for CoinGecko API requests
COINGECKO_HEADERS = {
    "x-cg-demo-api-key": COINGECKO_API_KEY
}

# Initialize python-binance client (no API key needed for public endpoints)
binance_client = Client()  # No API key or secret required for public data

# Fetch CoinGecko coin list and create symbol-to-ID mapping at startup
try:
    coin_list_url = "https://api.coingecko.com/api/v3/coins/list"
    coin_list_response = requests.get(coin_list_url, headers=COINGECKO_HEADERS, timeout=TIMEOUT)
    coin_list_response.raise_for_status()
    coin_list = coin_list_response.json()
    symbol_to_id = {coin['symbol'].lower(): coin['id'] for coin in coin_list}
    logger.info(f"Loaded {len(symbol_to_id)} coin mappings from CoinGecko")
except Exception as e:
    logger.error(f"Failed to fetch CoinGecko coin list: {str(e)}")
    symbol_to_id = {}

# Helper function to fetch data from Binance using python-binance
async def fetch_binance_detail(symbol):
    """
    Fetch market data for a specific coin from Binance using python-binance.
    Returns a dictionary with price_usd and volume_24h.
    """
    binance_data = {
        'price_usd': None,
        'volume_24h': None
    }

    try:
        # Fetch 24h ticker data from Binance
        ticker = await asyncio.to_thread(
            binance_client.get_ticker,
            symbol=symbol  # e.g., AAVEUSDT
        )
        binance_data['price_usd'] = float(ticker.get('lastPrice', 0))
        binance_data['volume_24h'] = float(ticker.get('volume', 0)) * binance_data['price_usd']  # Convert to USD

    except Exception as e:
        logger.error(f"Error fetching Binance data for {symbol}: {str(e)}")

    return binance_data

# Helper function to fetch detailed coin data from CoinGecko
async def fetch_coingecko_detail(session, coingecko_id):
    """
    Fetch detailed data for a specific coin from CoinGecko using the /coins/{id} endpoint.
    Returns the raw data as a dictionary.
    """
    try:
        params = {
            'localization': 'false',
            'tickers': 'false',
            'market_data': 'true',
            'community_data': 'false',
            'developer_data': 'false',
            'sparkline': 'false'
        }
        async with session.get(
            f"https://api.coingecko.com/api/v3/coins/{coingecko_id}",
            params=params,
            headers=COINGECKO_HEADERS,  # Include API key in headers
            timeout=TIMEOUT
        ) as response:
            if response.status == 429:
                logger.warning(f"CoinGecko rate limit hit for coin {coingecko_id}")
                return None
            response.raise_for_status()
            data = await response.json()
            return data

    except Exception as e:
        logger.error(f"Error fetching CoinGecko detail for {coingecko_id}: {str(e)}")
        return None

# API endpoint to get detailed coin data (publicly accessible)
@coindetail_bp.route('/<coin_id>', methods=['GET'])
def get_coin_detail(coin_id):
    try:
        # Get the symbol from query parameters (sent from frontend)
        symbol = request.args.get('symbol', '').upper()  # e.g., AAVEUSDT
        if not symbol:
            logger.error("Symbol not provided in request")
            return jsonify({'error': 'Symbol is required'}), 400

        # Convert Binance symbol to CoinGecko symbol and ID
        coin_symbol = symbol.replace('USDT', '').lower()  # e.g., aave
        coingecko_id = symbol_to_id.get(coin_symbol)
        if not coingecko_id:
            logger.error(f"No CoinGecko ID found for symbol {coin_symbol}")
            return jsonify({'error': f"No CoinGecko ID found for symbol {coin_symbol}"}), 404

        # Fetch metadata from ClickHouse using coin_id
        query = """
        SELECT
            c.coin_id,
            c.name,
            c.symbol,
            c.image_url
        FROM {db}.coins c
        WHERE c.coin_id = %s
        """.format(db=DATABASE)

        logger.info(f"Executing query: {query} with coin_id: {coin_id}")
        result = execute_clickhouse_query(query, (coin_id,))
        logger.info(f"Query result: {result}")

        if not result.get('data'):
            logger.error(f"No coin found in ClickHouse for coin_id: {coin_id}")
            return jsonify({'error': f"No coin found for coin_id {coin_id}"}), 404

        coin_data = result['data'][0]

        # Fetch data from Binance (price_usd, volume_24h)
        binance_data = asyncio.run(fetch_binance_detail(symbol))

        # Fetch remaining data from CoinGecko
        async def fetch_coingecko():
            async with aiohttp.ClientSession() as session:
                return await fetch_coingecko_detail(session, coingecko_id)

        # Run async task in the event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        coingecko_data = loop.run_until_complete(fetch_coingecko())
        loop.close()

        if not coingecko_data:
            logger.error(f"Failed to fetch CoinGecko data for {coingecko_id}")
            return jsonify({'error': 'Failed to fetch coin details from CoinGecko'}), 500

        # Construct the response with the required fields
        coin_detail = {
            'coin_id': coin_data.get('coin_id', 'unknown'),
            'name': coin_data.get('name', 'Unknown'),  # Prioritize ClickHouse
            'symbol': coin_data.get('symbol', 'Unknown').upper(),  # Prioritize ClickHouse
            'image_url': coin_data.get('image_url', "https://via.placeholder.com/20"),
            'price_usd': binance_data.get('price_usd', 0),  # From Binance
            'market_cap': coingecko_data.get('market_data', {}).get('market_cap', {}).get('usd', 0),  # From CoinGecko
            'volume_24h': binance_data.get('volume_24h', 0),  # From Binance
            'circulating_supply': coingecko_data.get('market_data', {}).get('circulating_supply', 0),  # From CoinGecko
            'total_supply': coingecko_data.get('market_data', {}).get('total_supply', 0),  # From CoinGecko
            'max_supply': coingecko_data.get('market_data', {}).get('max_supply', 0),  # From CoinGecko
            'fdv': coingecko_data.get('market_data', {}).get('fully_diluted_valuation', {}).get('usd', 0),  # From CoinGecko
            'market_cap_rank': coingecko_data.get('market_cap_rank', 0),  # From CoinGecko
            'homepage': coingecko_data.get('links', {}).get('homepage', [''])[0] or '',  # From CoinGecko
            'twitter': coingecko_data.get('links', {}).get('twitter_screen_name', '') or '',  # From CoinGecko
            'explorers': coingecko_data.get('links', {}).get('blockchain_site', [])[:3] or [],  # From CoinGecko
            'rating_score': coingecko_data.get('coingecko_score', 0),  # From CoinGecko
        }

        logger.info(f"Returning coin detail for coin_id {coin_id}")
        return jsonify(coin_detail), 200

    except Exception as e:
        logger.error(f"Error in get_coin_detail for coin_id {coin_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500