import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Loads .env file

app = Flask(__name__)
CORS(app)  # Allow frontend to access this endpoint

@app.route('/api-key', methods=['GET'])
def get_api_key():
    api_key = os.getenv('GOOGLE_GENAI_API_KEY')
    if not api_key:
        return jsonify({'error': 'API key not set'}), 500
    return jsonify({'apiKey': api_key})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050) 