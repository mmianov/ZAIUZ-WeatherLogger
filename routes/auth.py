from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User
import bcrypt
from database import db
import re
from flasgger import swag_from

def register_auth_routes(app):
    @app.route("/api/login", methods=["POST"])
    @swag_from("../docs/auth/login.yml")
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data.get("username")).first()

        if not user or not bcrypt.checkpw(data["password"].encode(), user.password_hash.encode()):
            return jsonify({"msg": "Invalid credentials"}), 401

        token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )
        return jsonify({"token": token, "role": user.role})


    @app.route("/api/change_password", methods=["POST"])
    @jwt_required()
    @swag_from("../docs/auth/change_password.yml")
    def change_password():
        data = request.get_json()
        old = data.get("old_password")
        new = data.get("new_password")

        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not bcrypt.checkpw(old.encode(), user.password_hash.encode()):
            return jsonify({"msg": "Wrong old password"}), 400

        if len(new) < 8:
            return jsonify({"msg": "Password must be at least 8 characters long"}), 400
        if not re.search(r"[A-Z]", new):
            return jsonify({"msg": "Password must contain at least one uppercase letter"}), 400
        if not re.search(r"[a-z]", new):
            return jsonify({"msg": "Password must contain at least one lowercase letter"}), 400
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", new):
            return jsonify({"msg": "Password must contain at least one special character"}), 400

        user.password_hash = bcrypt.hashpw(new.encode(), bcrypt.gensalt()).decode()
        db.session.commit()

        return jsonify({"msg": "Password updated"}), 200


