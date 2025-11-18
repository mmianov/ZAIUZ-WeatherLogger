from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from database import db
from models import Series, Measurement
from datetime import datetime
from flasgger import swag_from

def register_measurements_routes(app):
    @app.get("/api/measurements")
    @swag_from("../docs/measurements/get_measurements.yml")
    def get_measurements():
        series_param = request.args.get("series_id")

        if not series_param:
            return jsonify([])

        try:
            series_ids = [int(x) for x in series_param.split(",")]
        except:
            return jsonify([])

        from_date = request.args.get("from")
        to_date = request.args.get("to")

        query = Measurement.query.filter(Measurement.series_id.in_(series_ids))

        if from_date:
            query = query.filter(Measurement.timestamp >= from_date)
        if to_date:
            query = query.filter(Measurement.timestamp <= to_date)

        results = query.order_by(Measurement.timestamp).all()

        return jsonify([
            {
                "id": m.id,
                "series_id": m.series_id,
                "timestamp": m.timestamp.isoformat(),
                "value": m.value
            }
            for m in results
        ])

    @app.route("/api/measurements", methods=["POST"])
    @jwt_required()
    @swag_from("../docs/measurements/add_measurement.yml")
    def add_measurement():
        claims = get_jwt()
        if claims["role"] != "admin":
            return jsonify({"msg": "Admins only"}), 403

        data = request.get_json()
        series = Series.query.get(data["series_id"])
        if not series:
            return jsonify({"msg": "Series not found"}), 404

        if not (series.min_value <= data["value"] <= series.max_value):
            return jsonify({"msg": f"Value {data['value']} out of range"}), 400

        m = Measurement(
            series_id=data["series_id"],
            value=data["value"],
            timestamp=datetime.fromisoformat(data["timestamp"])
        )
        db.session.add(m)
        db.session.commit()
        return jsonify({"msg": "Measurement added"}), 201

    @app.route("/api/measurements/<int:mid>", methods=["PUT"])
    @jwt_required()
    @swag_from("../docs/measurements/update_measurement.yml")
    def update_measurement(mid):
        claims = get_jwt()
        if claims["role"] != "admin":
            return jsonify({"msg": "Admins only"}), 403

        m = Measurement.query.get(mid)
        if not m:
            return jsonify({"msg": "Measurement not found"}), 404

        data = request.get_json()
        series = Series.query.get(m.series_id)
        if "value" in data and not (series.min_value <= data["value"] <= series.max_value):
            return jsonify({"msg": f"Value {data['value']} out of range"}), 400

        m.value = data.get("value", m.value)
        if "timestamp" in data:
            m.timestamp = datetime.fromisoformat(data["timestamp"])
        db.session.commit()
        return jsonify({"msg": "Measurement updated"}), 200

    @app.route("/api/measurements/<int:mid>", methods=["DELETE"])
    @jwt_required()
    @swag_from("../docs/measurements/delete_measurement.yml")
    def delete_measurement(mid):
        claims = get_jwt()
        if claims["role"] != "admin":
            return jsonify({"msg": "Admins only"}), 403

        m = Measurement.query.get(mid)
        if not m:
            return jsonify({"msg": "Measurement not found"}), 404
        db.session.delete(m)
        db.session.commit()
        return jsonify({"msg": "Measurement deleted"}), 200
