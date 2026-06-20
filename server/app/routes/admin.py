from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.config.database import get_collection
from app.services.gamification_service import ALL_CHALLENGES
from bson import ObjectId
from datetime import datetime
import logging

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)

async def require_admin(user: dict = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

@router.get("/users")
async def list_all_users(admin: dict = Depends(require_admin)):
    users = get_collection("users")
    cursor = users.find({}, {"password_hash": 0}).sort("created_at", -1).limit(200)
    results = await cursor.to_list(length=200)
    return {"users": [{
        "id": str(u["_id"]), "name": u["name"], "email": u["email"],
        "eco_level": u.get("eco_level", "Eco Beginner"),
        "xp": u.get("xp", 0), "streak": u.get("streak", 0),
        "total_carbon_saved": u.get("total_carbon_saved", 0),
        "badges": u.get("badges", []),
        "is_admin": u.get("is_admin", False),
        "email_verified": u.get("email_verified", False),
        "created_at": u.get("created_at").isoformat() if u.get("created_at") else None,
        "last_active": u.get("last_active").isoformat() if u.get("last_active") else None,
    } for u in results]}

@router.get("/stats")
async def platform_stats(admin: dict = Depends(require_admin)):
    users = get_collection("users")
    notifications = get_collection("notifications")
    activities = get_collection("activities")
    total_users = await users.count_documents({})
    total_xp = await users.aggregate([{"$group": {"_id": None, "total": {"$sum": "$xp"}}}]).to_list(1)
    total_saved = await users.aggregate([{"$group": {"_id": None, "total": {"$sum": "$total_carbon_saved"}}}]).to_list(1)
    active_today = await users.count_documents({"last_active": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}})
    total_notifications = await notifications.count_documents({})
    total_activities = await activities.count_documents({})
    return {
        "total_users": total_users,
        "total_xp": total_xp[0]["total"] if total_xp else 0,
        "total_carbon_saved_kg": round(total_saved[0]["total"], 2) if total_saved else 0,
        "active_today": active_today,
        "total_notifications": total_notifications,
        "total_activities": total_activities,
        "timestamp": datetime.utcnow().isoformat(),
    }

@router.get("/challenges")
async def list_challenges(admin: dict = Depends(require_admin)):
    return {"challenges": ALL_CHALLENGES}

@router.put("/users/{user_id}")
async def update_user(user_id: str, data: dict, admin: dict = Depends(require_admin)):
    users = get_collection("users")
    allowed = {"xp", "streak", "eco_level", "total_carbon_saved", "is_admin", "email_verified", "name", "bio", "location"}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    result = await users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    users = get_collection("users")
    result = await users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}
