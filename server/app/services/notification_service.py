from app.config.database import get_collection
from datetime import datetime
from bson import ObjectId
from typing import Optional, List

async def create_notification(
    user_id: str,
    type: str,
    title: str,
    message: str,
    data: Optional[dict] = None,
) -> dict:
    notif = {
        "user_id": ObjectId(user_id),
        "type": type,
        "title": title,
        "message": message,
        "data": data or {},
        "read": False,
        "created_at": datetime.utcnow(),
    }
    col = get_collection("notifications")
    result = await col.insert_one(notif)
    notif["_id"] = result.inserted_id
    return notif

async def get_notifications(user_id: str, limit: int = 50) -> List[dict]:
    col = get_collection("notifications")
    cursor = col.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(limit)
    return await cursor.to_list(length=limit)

async def get_unread_count(user_id: str) -> int:
    col = get_collection("notifications")
    return await col.count_documents({"user_id": ObjectId(user_id), "read": False})

async def mark_read(user_id: str, notif_id: str) -> bool:
    col = get_collection("notifications")
    result = await col.update_one(
        {"_id": ObjectId(notif_id), "user_id": ObjectId(user_id)},
        {"$set": {"read": True}},
    )
    return result.modified_count > 0

async def mark_all_read(user_id: str) -> int:
    col = get_collection("notifications")
    result = await col.update_many(
        {"user_id": ObjectId(user_id), "read": False},
        {"$set": {"read": True}},
    )
    return result.modified_count
