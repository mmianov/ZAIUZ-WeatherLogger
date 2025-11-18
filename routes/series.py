from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from database import db
from models import Series
from flasgger import swag_from

def register_series_routes(app):

    @app.route("/api/series", methods=["GET"])
    @swag_from("../docs/series/get_series.yml")
    def get_series():
        series = Series.query.all()
        return jsonify([{
            "id": s.id,
            "name": s.name,
            "color": s.color,
            "min_value": s.min_value,
            "max_value": s.max_value
        } for s in series])


    @app.route("/api/series", methods=["POST"])
    @jwt_required()
    @swag_from("../docs/series/add_series.yml")
    def add_series():
        claims = get_jwt()
        if claims["role"] != "admin":
            return jsonify({"msg": "Admins only"}), 403

        data = request.get_json()
        s = Series(
            name=data["name"],
            color=data.get("color", "#000000"),
            min_value=data["min_value"],
            max_value=data["max_value"]
        )
        db.session.add(s)
        db.session.commit()
        return jsonify({"msg": "Series added"}), 201

    @app.route("/api/series/<int:series_id>", methods=["PUT"])
    @jwt_required()
    @swag_from("../docs/series/update_series.yml")
    def update_series(series_id):
        claims = get_jwt()
        if claims["role"] != "admin":
            return jsonify({"msg": "Admins only"}), 403

        s = Series.query.get(series_id)
        if not s:
            return jsonify({"msg": "Series not found"}), 404

        data = request.get_json()
        s.name = data.get("name", s.name)
        s.color = data.get("color", s.color)
        s.min_value = data.get("min_value", s.min_value)
        s.max_value = data.get("max_value", s.max_value)
        db.session.commit()
        return jsonify({"msg": "Series updated"}), 200

    @app.route("/api/series/<int:series_id>", methods=["DELETE"])
    @jwt_required()
    @swag_from("../docs/series/delete_series.yml")
    def delete_series(series_id):
        claims = get_jwt()
        if claims["role"] != "admin":
            return jsonify({"msg": "Admins only"}), 403

        s = Series.query.get(series_id)
        if not s:
            return jsonify({"msg": "Series not found"}), 404
        db.session.delete(s)
        db.session.commit()
        return jsonify({"msg": "Series deleted"}), 200


