from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)
client: AsyncIOMotorClient = None

async def connect_to_mongo():
    global client
    try:
        client = AsyncIOMotorClient(settings.mongodb_url)
        await client.admin.command("ping")
        logger.info("✅ Connected to MongoDB Atlas successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    global client
    if client:
        client.close()

def get_database():
    return client[settings.database_name]

def get_collection(collection_name: str):
    return get_database()[collection_name]
