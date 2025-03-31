from flask import Blueprint, request, jsonify, make_response
import requests
import bcrypt
from flask_cors import CORS
import uuid
from datetime import datetime, timezone, timedelta

# Initialize the Blueprint for auth routes
auth_bp = Blueprint('auth', __name__)
CORS(auth_bp, supports_credentials=True, origins="*")  # Enable CORS for the auth blueprint

# ClickHouse Configuration
CLICKHOUSE_HOST = "http://localhost:8124"
DATABASE = "blocktrade_track"

# Helper function to hash passwords
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Helper function to verify passwords
def verify_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

# Helper function to check if email or username already exists (excluding the current user)
def check_user_exists(username, exclude_user_id=None):
    query = f"""
    SELECT user_id FROM {DATABASE}.users 
    WHERE (email = '{username}' OR username = '{username}')
    """
    if exclude_user_id:
        query += f" AND user_id != '{exclude_user_id}'"
    query += " FORMAT JSON"
    url = f"{CLICKHOUSE_HOST}/?query={query}"
    response = requests.get(url)
    result = response.json()
    return 'data' in result and result['data']

# Helper function to validate user_id
def validate_user(user_id):
    query = f"""
    SELECT * FROM {DATABASE}.users 
    WHERE user_id = '{user_id}' 
    FORMAT JSON
    """
    url = f"{CLICKHOUSE_HOST}/?query={query}"
    response = requests.get(url)
    result = response.json()
    return result.get('data', [])

# Register endpoint
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        image_url = data.get('image_url', '')
        username = data.get('username')
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        # Validate required fields
        if not all([name, email, username, password, confirm_password]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if passwords match
        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        # Check if username or email already exists
        if check_user_exists(username):
            return jsonify({'error': 'Username or email already exists'}), 409

        # Hash the password
        password_hash = hash_password(password)

        # Insert the new user into the users table
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        points = 1000.0  # Default points

        insert_query = f"""
        INSERT INTO {DATABASE}.users (user_id, name, email, image_url, username, password_hash, created_at, points)
        VALUES ('{user_id}', '{name}', '{email}', '{image_url}', '{username}', '{password_hash}', '{created_at}', {points})
        """
        insert_url = f"{CLICKHOUSE_HOST}/?query={insert_query}"
        insert_response = requests.post(insert_url)

        if insert_response.status_code == 200:
            return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201
        else:
            return jsonify({'error': insert_response.text}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Login endpoint
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Validate required fields
        if not all([username, password]):
            return jsonify({'error': 'Missing username or password'}), 400

        # Query recent users (last 1 year)
        one_year_ago = (datetime.now(timezone.utc) - timedelta(days=365)).strftime('%Y-%m-%d')
        query_recent = f"""
        SELECT user_id, password_hash 
        FROM {DATABASE}.users 
        WHERE (username = '{username}' OR email = '{username}')
        AND created_at >= '{one_year_ago}' 
        FORMAT JSON
        """
        url = f"{CLICKHOUSE_HOST}/?query={query_recent}"
        response = requests.get(url)
        result = response.json()

        # If not found, search full table
        if 'data' not in result or not result['data']:
            query_full = f"""
            SELECT user_id, password_hash 
            FROM {DATABASE}.users 
            WHERE username = '{username}' OR email = '{username}'
            FORMAT JSON
            """
            url = f"{CLICKHOUSE_HOST}/?query={query_full}"
            response = requests.get(url)
            result = response.json()

        if 'data' not in result or not result['data']:
            return jsonify({'error': 'Invalid username or password'}), 401

        user_id, password_hash = result['data'][0]['user_id'], result['data'][0]['password_hash']

        # Verify password
        if not verify_password(password, password_hash):
            return jsonify({'error': 'Invalid username or password'}), 401

        # Create response and set cookie
        response = make_response(jsonify({'message': 'Login successful', 'user_id': user_id}), 200)

        return response

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Check authentication endpoint
@auth_bp.route('/me', methods=['GET'])
def check_auth():
    try:
        user_id = request.cookies.get('user')
        # Không kiểm tra if not user_id, giả sử luôn có cookie từ frontend

        query = f"""
        SELECT user_id, name, email, image_url, username, created_at, points
        FROM {DATABASE}.users
        WHERE user_id = '{user_id}'
        FORMAT JSON
        """
        url = f"{CLICKHOUSE_HOST}/?query={query}"
        response = requests.get(url)

        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch user data'}), 500

        result = response.json()
        if 'data' in result and result['data']:
            user_data = result['data'][0]
            return jsonify(user_data), 200
        else:
            return jsonify(None), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update user profile endpoint
@auth_bp.route('/update', methods=['PUT'])
def update_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        name = data.get('name')
        email = data.get('email')
        image_url = data.get('image_url')
        username = data.get('username')
        password = data.get('password')

        # Validate required fields
        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400

        # Validate user_id
        user_data = validate_user(user_id)
        if not user_data:
            return jsonify({'error': 'Invalid user_id'}), 404
        user = user_data[0]

        # Prepare fields to update
        updates = []
        if name:
            updates.append(f"name = '{name}'")
        if email:
            updates.append(f"email = '{email}'")
        if image_url is not None:  # Allow empty string for image_url
            updates.append(f"image_url = '{image_url}'")
        if username:
            updates.append(f"username = '{username}'")
        if password:
            password_hash = hash_password(password)
            updates.append(f"password_hash = '{password_hash}'")

        # If no fields to update, return error
        if not updates:
            return jsonify({'error': 'No fields to update'}), 400

        # Check for email or username conflicts
        check_username = username if username else user['username']
        if check_user_exists(check_username, exclude_user_id=user_id):
            return jsonify({'error': 'Email or username already exists'}), 409

        # Build and execute the UPDATE query
        update_query = f"""
        ALTER TABLE {DATABASE}.users 
        UPDATE {', '.join(updates)}
        WHERE user_id = '{user_id}'
        """
        update_url = f"{CLICKHOUSE_HOST}/?query={update_query}"
        update_response = requests.post(update_url)

        if update_response.status_code == 200:
            return jsonify({'message': 'User profile updated successfully'}), 200
        else:
            return jsonify({'error': update_response.text}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500