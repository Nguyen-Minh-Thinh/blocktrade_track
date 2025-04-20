import clickhouse_connect
from flask import Blueprint, g
from clickhouse_connect.driver.exceptions import ClickHouseError

# Initialize the Blueprint for ClickHouse config routes (optional, not used directly in routes)
clickhouse_config_bp = Blueprint('clickhouse_config', __name__)

# ClickHouse Configuration
CLICKHOUSE_HOST = "localhost"
CLICKHOUSE_PORT = 8124
DATABASE = "blocktrade_track"
CLICKHOUSE_USER = "default"
CLICKHOUSE_PASSWORD = "123456"

def get_clickhouse_client():
    """
    Get a ClickHouse client instance for the current request.
    Creates a new client if one doesn't exist in the request context.
    """
    if 'clickhouse_client' not in g:
        g.clickhouse_client = clickhouse_connect.get_client(
            host=CLICKHOUSE_HOST,
            port=CLICKHOUSE_PORT,
            database=DATABASE,
            username=CLICKHOUSE_USER,
            password=CLICKHOUSE_PASSWORD
        )
    return g.clickhouse_client

def close_clickhouse_client(e=None):
    """
    Close the ClickHouse client instance for the current request.
    Called automatically at the end of the request.
    """
    client = g.pop('clickhouse_client', None)
    if client is not None:
        client.close()

# Helper function to send a query to ClickHouse using clickhouse_connect
def execute_clickhouse_query(query, params=None):
    try:
        # Get the per-request client
        client = get_clickhouse_client()

        # Determine if it's a SELECT query
        is_select_query = query.strip().upper().startswith("SELECT")

        # Prepare parameters for safe substitution
        query_params = params or {}

        # Execute the query
        if is_select_query:
            # For SELECT queries, request JSON-like data (list of dicts)
            result = client.query(query, parameters=query_params)
            # Convert rows to a JSON-like structure
            data = [dict(zip(result.column_names, row)) for row in result.result_rows]
            return {"data": data}
        else:
            # For INSERT, UPDATE, DELETE, etc., execute without expecting results
            client.command(query, parameters=query_params)
            return {"data": []}

    except ClickHouseError as e:
        raise Exception(f"ClickHouse query failed: {str(e)}")
    except Exception as e:
        raise Exception(f"ClickHouse query failed: {str(e)}")

def init_app(app):
    """
    Register the teardown function with the Flask app.
    Ensures the ClickHouse client is closed at the end of each request.
    """
    app.teardown_appcontext(close_clickhouse_client)