from flask import Flask
from api.auth import auth_bp  # Import the auth blueprint

# Initialize the Flask app
app = Flask(__name__)

# Register blueprints (API modules)
app.register_blueprint(auth_bp, url_prefix='/auth')  # Routes for authentication (e.g., /auth/register)

# Optional: Add a root route to verify the server is running
@app.route('/')
def home():
    return {"message": "Welcome to BlockTrade Track API"}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)