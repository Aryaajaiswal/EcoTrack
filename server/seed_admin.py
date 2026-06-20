"""Run once to create an admin user."""
import asyncio
from app.config.database import connect_to_mongo, close_mongo_connection, get_collection
from app.utils.password import hash_password

async def seed():
    await connect_to_mongo()
    users = get_collection("users")
    existing = await users.find_one({"email": "admin@ecotrack.ai"})
    if existing:
        print("Admin user already exists")
    else:
        await users.insert_one({
            "name": "Admin",
            "email": "admin@ecotrack.ai",
            "password_hash": hash_password("admin123"),
            "bio": "Platform administrator",
            "location": "",
            "avatar_color": "#ef4444",
            "eco_level": "Climate Hero",
            "xp": 99999,
            "streak": 365,
            "total_carbon_saved": 10000.0,
            "badges": ["first_step", "eco_week", "green_warrior", "carbon_ninja", "climate_champion", "challenge_master", "streak_legend", "planet_protector"],
            "is_admin": True,
            "email_verified": True,
            "challenges_completed": 99,
            "last_calculation": None,
            "daily_emissions": [],
            "created_at": __import__("datetime").datetime.utcnow(),
            "last_active": __import__("datetime").datetime.utcnow(),
        })
        print("Admin user created: admin@ecotrack.ai / admin123")
    await close_mongo_connection()

asyncio.run(seed())
