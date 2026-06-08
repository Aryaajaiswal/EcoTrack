"""MongoDB database connection and management."""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient = None


async def connect_to_mongo():
    """Create database connection."""
    global client
    try:
        client = AsyncIOMotorClient(settings.mongodb_url)
        # Verify connection
        await client.admin.command("ping")
        logger.info("✅ Connected to MongoDB Atlas successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection."""
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")


def get_database():
    """Return the database instance."""
    return client[settings.database_name]


def get_collection(collection_name: str):
    """Return a specific collection."""
    db = get_database()
    return db[collection_name]
