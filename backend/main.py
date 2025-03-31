from flask import Flask
from flask_cors import CORS  # Added for CORS support
from api.auth import auth_bp  # Import the auth blueprint
from api.portfolio import portfolio_bp
from api.transactions import transactions_bp
from api.favorites import favorites_bp

# Initialize the Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins="*")

# Register blueprints (API modules)
app.register_blueprint(auth_bp, url_prefix='/auth')  # Routes for authentication (e.g., /auth/register)
app.register_blueprint(portfolio_bp, url_prefix='/portfolio')  # Routes for portfolio (e.g., /portfolio/add)
app.register_blueprint(transactions_bp, url_prefix='/transactions')
app.register_blueprint(favorites_bp, url_prefix='/favorites')

# Optional: Add a root route to verify the server is running
@app.route('/')
def home():
    return {"message": "Welcome to BlockTrade Track API"}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)