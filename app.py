from flask import Flask
from flask_cors import CORS
from database import db, jwt
from routes import register_routes
import os
from dotenv import load_dotenv
from flasgger import Swagger

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///weatherlogger.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "dev-secret")

    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    register_routes(app)

    return app


app = create_app()

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "WeatherLogger API",
        "description": "API for managing measurements and series",
        "version": "1.0.0"
    },
    "basePath": "/",
    "schemes": ["http", "https"],
    "securityDefinitions": {
        "JWT": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header"
        }
    }
}

swagger = Swagger(app, template=swagger_template)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=False, host="0.0.0.0")
