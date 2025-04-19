import clickhouse_connect
from flask import Blueprint
from clickhouse_connect.driver.exceptions import ClickHouseError

# Initialize the Blueprint for ClickHouse config routes (optional, not used directly in routes)
clickhouse_config_bp = Blueprint('clickhouse_config', __name__)

# ClickHouse Configuration
CLICKHOUSE_HOST = "localhost"
CLICKHOUSE_PORT = 8124
DATABASE = "blocktrade_track"
CLICKHOUSE_USER = "default"
CLICKHOUSE_PASSWORD = "123456"

# Create ClickHouse client
client = clickhouse_connect.get_client(
    host=CLICKHOUSE_HOST,
    port=CLICKHOUSE_PORT,
    database=DATABASE,
    username=CLICKHOUSE_USER,
    password=CLICKHOUSE_PASSWORD
)

# Helper function to send a query to ClickHouse using clickhouse_connect
def execute_clickhouse_query(query, params=None):
    try:
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

    except ClickHouseError  as e:
        raise Exception(f"ClickHouse query failed: {str(e)}")
    except Exception as e:
        raise Exception(f"ClickHouse query failed: {str(e)}")