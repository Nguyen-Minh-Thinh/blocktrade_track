from flask import Blueprint, request, jsonify, make_response
import bcrypt
from flask_cors import CORS
import uuid
from datetime import datetime, timezone, timedelta
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .clickhouse_config import execute_clickhouse_query, DATABASE  # Nhập từ clickhouse_config.py
import requests
from werkzeug.utils import secure_filename

# Initialize the Blueprint for auth routes
auth_bp = Blueprint('auth', __name__)
CORS(auth_bp, supports_credentials=True, origins="*")


# Imgur Client ID (https://api.imgur.com/)
IMGUR_CLIENT_ID = "7a5dd71412cf78d"

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Email Configuration (Gmail SMTP)
EMAIL_ADDRESS = "dnthien29@gmail.com"
EMAIL_PASSWORD = "cjgh ldei fozg itie"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    WHERE (email = %(username)s OR username = %(username)s)
    """
    if exclude_user_id:
        query += f" AND user_id != %(exclude_user_id)s"
    result = execute_clickhouse_query(query, params={
        "username": username,
        "exclude_user_id": exclude_user_id
    })
    return bool(result.get('data', []))

# Helper function to validate user_id
def validate_user(user_id):
    query = f"""
    SELECT * FROM {DATABASE}.users 
    WHERE user_id = %(user_id)s 
    """
    result = execute_clickhouse_query(query, params={"user_id": user_id})
    return result.get('data', [])

# Helper function to validate email
def validate_user_by_email(email):
    query = f"""
    SELECT * FROM {DATABASE}.users 
    WHERE email = %(email)s 
    """
    result = execute_clickhouse_query(query, params={"email": email})
    return result.get('data', [])

# Helper function to generate a 6-digit code
def generate_reset_code():
    return str(random.randint(100000, 999999))

# Helper function to send email with reset code
def send_reset_code_email(email, code):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = email
        msg['Subject'] = "🔐 Blocktrade - Reset Your Password"

        # Email body in HTML format (Dark Mode, Styled like Blocktrade)
        body = f"""
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #0d1117;
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                }}
                .container {{
                    background-color: #161b22;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1);
                    width: 80%;
                    margin: auto;
                }}
                .logo {{
                    margin-bottom: 20px;
                }}
                h2 {{
                    color: #f97316;
                }}
                p {{
                    font-size: 16px;
                    color: #c9d1d9;
                }}
                .code {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #58a6ff;
                    background: #21262d;
                    padding: 10px;
                    border-radius: 5px;
                    display: inline-block;
                    margin: 10px 0;
                }}
                .footer {{
                    margin-top: 20px;
                    font-size: 14px;
                    color: #8b949e;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://i.imgur.com/AnYXkxG.png" alt="Blocktrade Logo" class="logo" width="150">
                <h2>🔐 Reset Your Password</h2>
                <p>Hello,</p>
                <p>You requested to reset your password on <strong>Blocktrade</strong>. Use the code below to proceed:</p>
                <div class="code">{code}</div>
                <p>This code is valid for <strong>3 minutes</strong>.</p>
                <p>If you did not request this, please ignore this email.</p>
                <hr>
                <p class="footer">© 2025 Blocktrade. All rights reserved.</p>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(body, 'html'))

        # Send email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, email, msg.as_string())

        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

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
        VALUES (%(user_id)s, %(name)s, %(email)s, %(image_url)s, %(username)s, %(password_hash)s, %(created_at)s, %(points)s)
        """
        execute_clickhouse_query(insert_query, params={
            "user_id": user_id,
            "name": name,
            "email": email,
            "image_url": image_url,
            "username": username,
            "password_hash": password_hash,
            "created_at": created_at,
            "points": points
        })

        return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201

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
        WHERE (username = %(username)s OR email = %(username)s)
        AND created_at >= %(one_year_ago)s 
        """
        result = execute_clickhouse_query(query_recent, params={
            "username": username,
            "one_year_ago": one_year_ago
        })

        # If not found, search full table
        if not result.get('data', []):
            query_full = f"""
            SELECT user_id, password_hash 
            FROM {DATABASE}.users 
            WHERE username = %(username)s OR email = %(username)s
            """
            result = execute_clickhouse_query(query_full, params={"username": username})

        if not result.get('data', []):
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
        
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        query = f"""
        SELECT user_id, name, email, image_url, username, created_at, points
        FROM {DATABASE}.users
        WHERE user_id = %(user_id)s
        """
        result = execute_clickhouse_query(query, params={"user_id": user_id})

        if not result.get('data', []):
            return jsonify(None), 200

        user_data = result['data'][0]
        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update user profile endpoint
@auth_bp.route('/update', methods=['PUT'])
def update_user():
    try:
        # Handle form data (multipart/form-data)
        user_id = request.form.get('user_id')
        name = request.form.get('name')
        email = request.form.get('email')
        username = request.form.get('username')
        password = request.form.get('password')
        image_url = request.form.get('image_url')  # URL từ frontend nếu không gửi file

        # Handle image file upload to Imgur if file is provided
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                headers = {'Authorization': f'Client-ID {IMGUR_CLIENT_ID}'}
                response = requests.post(
                    'https://api.imgur.com/3/image',
                    headers=headers,
                    files={'image': file}
                )
                if response.status_code == 200:
                    image_url = response.json()['data']['link']
                else:
                    return jsonify({'error': 'Failed to upload image to Imgur'}), 500
            else:
                return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, GIF allowed'}), 400

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
            updates.append(f"name = %(name)s")
        if email:
            updates.append(f"email = %(email)s")
        if image_url is not None:  # Chỉ cập nhật image_url nếu có file hoặc URL mới
            updates.append(f"image_url = %(image_url)s")
        if username:
            updates.append(f"username = %(username)s")
        if password:
            password_hash = hash_password(password)
            updates.append(f"password_hash = %(password_hash)s")

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
        WHERE user_id = %(user_id)s
        """
        params = {"user_id": user_id}
        if name:
            params["name"] = name
        if email:
            params["email"] = email
        if image_url is not None:
            params["image_url"] = image_url
        if username:
            params["username"] = username
        if password:
            params["password_hash"] = password_hash

        execute_clickhouse_query(update_query, params=params)

        return jsonify({'message': 'User profile updated successfully', 'image_url': image_url}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Forgot Password endpoint
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        # Validate required fields
        if not email:
            return jsonify({'error': 'Missing email'}), 400

        # Check if email exists
        user_data = validate_user_by_email(email)
        if not user_data:
            return jsonify({'error': 'Email not found'}), 404
        user = user_data[0]
        user_id = user['user_id']

        # Generate a 6-digit code
        reset_code = generate_reset_code()

        # Calculate expiration time (3 minutes from now)
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=3)).strftime('%Y-%m-%d %H:%M:%S')

        # Store the reset code in the database
        insert_query = f"""
        INSERT INTO {DATABASE}.password_reset_tokens (user_id, token, expires_at)
        VALUES (%(user_id)s, %(token)s, %(expires_at)s)
        """
        execute_clickhouse_query(insert_query, params={
            "user_id": user_id,
            "token": reset_code,
            "expires_at": expires_at
        })

        # Send the reset code via email
        if not send_reset_code_email(email, reset_code):
            return jsonify({'error': 'Failed to send reset code email'}), 500

        return jsonify({'message': 'Reset code sent to your email'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Verify Reset Code endpoint
@auth_bp.route('/verify-reset-code', methods=['POST'])
def verify_reset_code():
    try:
        data = request.get_json()
        email = data.get('email')
        code = data.get('code')

        # Validate required fields
        if not all([email, code]):
            return jsonify({'error': 'Missing email or code'}), 400

        # Check if email exists
        user_data = validate_user_by_email(email)
        if not user_data:
            return jsonify({'error': 'Email not found'}), 404
        user = user_data[0]
        user_id = user['user_id']

        # Check if the code exists and is valid
        current_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        query = f"""
        SELECT * FROM {DATABASE}.password_reset_tokens 
        WHERE user_id = %(user_id)s 
        AND token = %(code)s 
        AND expires_at > %(current_time)s
        """
        result = execute_clickhouse_query(query, params={
            "user_id": user_id,
            "code": code,
            "current_time": current_time
        })

        if not result.get('data', []):
            return jsonify({'error': 'Invalid or expired code'}), 400

        return jsonify({'message': 'Code verified successfully', 'user_id': user_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Reset Password endpoint
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        code = data.get('code')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        # Validate required fields
        if not all([user_id, code, new_password, confirm_password]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if passwords match
        if new_password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        # Validate user_id
        user_data = validate_user(user_id)
        if not user_data:
            return jsonify({'error': 'Invalid user_id'}), 404

        # Check if the code exists and is valid
        current_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        query = f"""
        SELECT * FROM {DATABASE}.password_reset_tokens 
        WHERE user_id = %(user_id)s 
        AND token = %(code)s 
        AND expires_at > %(current_time)s
        """
        result = execute_clickhouse_query(query, params={
            "user_id": user_id,
            "code": code,
            "current_time": current_time
        })

        if not result.get('data', []):
            return jsonify({'error': 'Invalid or expired code'}), 400

        # Update the user's password
        password_hash = hash_password(new_password)
        update_query = f"""
        ALTER TABLE {DATABASE}.users 
        UPDATE password_hash = %(password_hash)s
        WHERE user_id = %(user_id)s
        """
        execute_clickhouse_query(update_query, params={
            "password_hash": password_hash,
            "user_id": user_id
        })

        # Delete the used reset code
        delete_query = f"""
        ALTER TABLE {DATABASE}.password_reset_tokens 
        DELETE WHERE user_id = %(user_id)s AND token = %(code)s
        """
        execute_clickhouse_query(delete_query, params={
            "user_id": user_id,
            "code": code
        })

        return jsonify({'message': 'Password reset successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500