from .auth import register_auth_routes
from .measurements import register_measurements_routes
from .series import register_series_routes

def register_routes(app):
    register_auth_routes(app)
    register_measurements_routes(app)
    register_series_routes(app)
