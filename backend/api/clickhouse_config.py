import requests
from flask import Blueprint

# Initialize the Blueprint for favorites routes
clickhouse_config_bp = Blueprint('clickhouse_config', __name__)

# ClickHouse Configuration
CLICKHOUSE_HOST = "http://localhost:8124"
DATABASE = "blocktrade_track"
CLICKHOUSE_USER = "default"
CLICKHOUSE_PASSWORD = "123456"  

# Helper function to send a query to ClickHouse via HTTP API
def execute_clickhouse_query(query, params=None):
    # Add FORMAT JSON to get structured JSON responses (for SELECT queries)
    is_select_query = query.strip().upper().startswith("SELECT")
    if is_select_query:
        query = f"{query} FORMAT JSON"

    # Manually substitute parameters into the query string
    if params:
        for key, value in params.items():
            # Sanitize the value to prevent SQL injection
            if isinstance(value, str):
                # Escape single quotes by doubling them (ClickHouse uses '' for escaping)
                escaped_value = value.replace("'", "''")
                sanitized_value = f"'{escaped_value}'"
            else:
                sanitized_value = str(value)
            query = query.replace(f"%({key})s", sanitized_value)

    # Construct the URL with the database parameter
    url = f"{CLICKHOUSE_HOST}/?database={DATABASE}"

    try:
        # Use GET for SELECT queries (read-only), POST for modifying queries (INSERT, UPDATE, DELETE)
        if is_select_query:
            url = f"{url}&query={query}"
            response = requests.get(url, auth=(CLICKHOUSE_USER, CLICKHOUSE_PASSWORD))
        else:
            response = requests.post(url, data=query, headers={'Content-Type': 'text/plain'},
                                   auth=(CLICKHOUSE_USER, CLICKHOUSE_PASSWORD))

        if response.status_code != 200:
            raise Exception(f"ClickHouse query failed: {response.text}")

        # For SELECT queries, parse the JSON response
        if is_select_query:
            return response.json()
        # For modifying queries, return an empty dict (ClickHouse doesn't return data for these)
        return {"data": []}
    except requests.exceptions.RequestException as e:
        raise Exception(f"ClickHouse query failed: {str(e)}")
    except ValueError as e:
        raise Exception(f"Failed to parse ClickHouse response as JSON: {str(e)}")
