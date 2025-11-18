from app import create_app
from database import db
from models import User, Series, Measurement
from datetime import datetime, timedelta
import bcrypt, random
import os
from dotenv import load_dotenv

load_dotenv()


app = create_app()
with app.app_context():
    db.drop_all()
    db.create_all()

    admin_password = os.getenv("ADMIN_PASSWORD")
    password = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
    admin = User(username="admin", password_hash=password, role="admin")
    db.session.add(admin)

    warszawa = Series(name="Warszawa", color="#3b82f6", min_value=-30, max_value=50)
    gdansk = Series(name="Gdańsk", color="#10b981", min_value=-30, max_value=50)
    lublin = Series(name="Lublin", color="#a81cff", min_value=-30, max_value=50)
    db.session.add_all([warszawa, gdansk, lublin])
    db.session.commit()

    for i in range(10):
        db.session.add(Measurement(series_id=warszawa.id,
                                   timestamp=datetime.now() - timedelta(days=i),
                                   value=random.uniform(-5, 20)))
        db.session.add(Measurement(series_id=gdansk.id,
                                   timestamp=datetime.now() - timedelta(days=i),
                                   value=random.uniform(-3, 18)))
        db.session.add(Measurement(series_id=lublin.id,
                                   timestamp=datetime.now() - timedelta(days=i),
                                   value=random.uniform(0, 25)))

    db.session.commit()
    print("Database initialized with example data.")
