from flask import Blueprint, request, jsonify, Response
import pytz
import datetime
import clickhouse_connect
from collections import defaultdict
import simplejson as json

historical_data_bp = Blueprint('historical_data', __name__)

@historical_data_bp.route('/all', methods=['GET'])
def get_all_data():
    # Get coin_symbol from query params (Example: /quarter?coin_symbol=btcusdt)
    coin_symbol = request.args.get('coin_symbol').upper()
    if not coin_symbol:
        return jsonify({'error': 'Missing required field: coin_symbol'}), 400
    
    clickhouse_client = clickhouse_connect.get_client(
        host='localhost',
        port='8124',
        user='default',
        password='',
        database='blocktrade_track'
    )
    try:
        coin_id_query = f"""
            SELECT coin_id
            FROM coins
            WHERE symbol=%(coin_symbol)s
        """
        coin_id = clickhouse_client.query(coin_id_query, parameters={'coin_symbol': coin_symbol}).result_rows[0][0]
    except Exception as e:
        return jsonify({'error': 'This coin does not exist!'}), 404
    # print(coin_id)
    query = f"""
        SELECT *
        FROM market_data 
        WHERE coin_id = %(coin_id)s
        ORDER BY updated_date DESC
    """
    try:
        result = clickhouse_client.query(query, parameters={'coin_id': coin_id})
        data = result.result_rows
        columns = result.column_names
        # Chuyển thành list of dicts
        records = defaultdict(list)
        for row in data:
            temp = {}
            for i in range(len(row)):
                if i == (len(row) - 1):
                    temp[columns[i]] = row[i].strftime('%Y-%m-%d %H:%M:%S')
                else:
                    temp[columns[i]] = row[i]
            records[coin_symbol].append(temp)
        print(records)
        return Response(
            json.dumps(records, use_decimal=True),  # dùng simplejson ở đây
            content_type='application/json'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@historical_data_bp.route('/one_month', methods=['GET'])
def get_one_month_data():
    # Get coin_symbol from query params (Example: /one_month?coin_symbol=BTCUSDT)
    coin_symbol = request.args.get('coin_symbol').upper()
    if not coin_symbol:
        return jsonify({'error': 'Missing required field: coin_symbol'}), 400
    
    clickhouse_client = clickhouse_connect.get_client(
        host='localhost',
        port='8124',
        user='default',
        password='',
        database='blocktrade_track'
    )
    try:
        coin_id_query = f"""
            SELECT coin_id
            FROM coins
            WHERE symbol=%(coin_symbol)s
        """
        coin_id = clickhouse_client.query(coin_id_query, parameters={'coin_symbol': coin_symbol}).result_rows[0][0]
    except Exception as e:
        return jsonify({'error': 'This coin does not exist!'}), 404
    # print(coin_id)
    query = f"""
        SELECT *
        FROM market_data
        WHERE coin_id = %(coin_id)s
            AND updated_date >= (today() - INTERVAL 1 MONTH)
        ORDER BY updated_date DESC
    """
    try:
        result = clickhouse_client.query(query, parameters={'coin_id': coin_id})
        data = result.result_rows
        columns = result.column_names
        # Chuyển thành list of dicts
        records = defaultdict(list)
        for row in data:
            temp = {}
            for i in range(len(row)):
                if i == (len(row) - 1):
                    temp[columns[i]] = row[i].strftime('%Y-%m-%d %H:%M:%S')
                else:
                    temp[columns[i]] = row[i]
            records[coin_symbol].append(temp)
        # print(records)
        return Response(
            json.dumps(records, use_decimal=True),  # dùng simplejson ở đây
            content_type='application/json'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@historical_data_bp.route('/seven_day', methods=['GET'])
def get_seven_day_data():
    # Get coin_symbol from query params (Example: /one_month?coin_symbol=BTCUSDT)
    coin_symbol = request.args.get('coin_symbol').upper()
    if not coin_symbol:
        return jsonify({'error': 'Missing required field: coin_symbol'}), 400
    
    clickhouse_client = clickhouse_connect.get_client(
        host='localhost',
        port='8124',
        user='default',
        password='',
        database='blocktrade_track'
    )
    try:
        coin_id_query = f"""
            SELECT coin_id
            FROM coins
            WHERE symbol=%(coin_symbol)s
        """
        coin_id = clickhouse_client.query(coin_id_query, parameters={'coin_symbol': coin_symbol}).result_rows[0][0]
    except Exception as e:
        return jsonify({'error': 'This coin does not exist!'}), 404
    # print(coin_id)
    query = f"""
        SELECT *
        FROM market_data
        WHERE coin_id = %(coin_id)s
            AND updated_date >= (today() - INTERVAL 7 DAY)
        ORDER BY updated_date DESC
    """
    try:
        result = clickhouse_client.query(query, parameters={'coin_id': coin_id})
        data = result.result_rows
        columns = result.column_names
        # Chuyển thành list of dicts
        records = defaultdict(list)
        for row in data:
            temp = {}
            for i in range(len(row)):
                if i == (len(row) - 1):
                    temp[columns[i]] = row[i].strftime('%Y-%m-%d %H:%M:%S')
                else:
                    temp[columns[i]] = row[i]
            records[coin_symbol].append(temp)
        print(records)
        return Response(
            json.dumps(records, use_decimal=True),  # dùng simplejson ở đây
            content_type='application/json'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    



