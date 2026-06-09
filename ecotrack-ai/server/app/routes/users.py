from fastapi import APIRouter, Depends
from app.models.user import UserUpdate, UserResponse
from app.middleware.auth import get_current_user
from app.config.database import get_collection
from app.routes.auth import user_doc_to_response
from datetime import datetime, timedelta
import logging

router = APIRouter(prefix="/users", tags=["Users"])
logger = logging.getLogger(__name__)


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return user_doc_to_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    users_collection = get_collection("users")
    fields = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if fields:
        await users_collection.update_one({"_id": current_user["_id"]}, {"$set": fields})
    updated = await users_collection.find_one({"_id": current_user["_id"]})
    return user_doc_to_response(updated)


@router.get("/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    from app.services.gamification_service import get_level_progress, get_all_badges
    activities_col = get_collection("activities")
    now = datetime.utcnow()
    user_activities = await activities_col.find({"user_id": str(current_user["_id"])}).sort("date", -1).limit(30).to_list(30)
    weekly_co2 = sum(a["co2_kg"] for a in user_activities if a.get("date") and a["date"] >= now - timedelta(days=7))
    monthly_co2 = sum(a["co2_kg"] for a in user_activities if a.get("date") and a["date"] >= now - timedelta(days=30))
    level_info = get_level_progress(current_user.get("xp", 0))
    all_badges = get_all_badges()
    earned_ids = set(current_user.get("badges", []))
    return {
        "user_id": str(current_user["_id"]),
        "xp": current_user.get("xp", 0),
        "streak": current_user.get("streak", 0),
        "total_carbon_saved": current_user.get("total_carbon_saved", 0.0),
        "eco_level": current_user.get("eco_level", "Eco Beginner"),
        "weekly_co2_kg": round(weekly_co2, 2),
        "monthly_co2_kg": round(monthly_co2, 2),
        "level_progress": level_info,
        "badges_earned": [b for b in all_badges if b["id"] in earned_ids],
        "badges_locked": [b for b in all_badges if b["id"] not in earned_ids][:5],
        "activity_count": len(user_activities),
    }
