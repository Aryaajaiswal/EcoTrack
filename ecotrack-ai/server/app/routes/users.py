"""User profile management routes."""
from fastapi import APIRouter, HTTPException, Depends, status
from bson import ObjectId
from app.models.user import UserUpdate, UserResponse
from app.middleware.auth import get_current_user
from app.config.database import get_collection
from app.routes.auth import user_doc_to_response
from datetime import datetime
import logging

router = APIRouter(prefix="/users", tags=["Users"])
logger = logging.getLogger(__name__)


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile."""
    return user_doc_to_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile."""
    users_collection = get_collection("users")

    update_fields = {}
    if update_data.name is not None:
        update_fields["name"] = update_data.name
    if update_data.bio is not None:
        update_fields["bio"] = update_data.bio
    if update_data.location is not None:
        update_fields["location"] = update_data.location
    if update_data.avatar_color is not None:
        update_fields["avatar_color"] = update_data.avatar_color

    if not update_fields:
        return user_doc_to_response(current_user)

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_fields}
    )

    # Return updated user
    updated_user = await users_collection.find_one({"_id": current_user["_id"]})
    return user_doc_to_response(updated_user)


@router.get("/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """Get detailed user statistics."""
    from app.services.gamification_service import get_level_progress, get_all_badges

    activities = get_collection("activities")
    user_activities = await activities.find(
        {"user_id": str(current_user["_id"])}
    ).sort("date", -1).limit(30).to_list(30)

    # Calculate weekly and monthly emissions
    from datetime import timedelta
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    weekly_co2 = sum(
        a["co2_kg"] for a in user_activities
        if a.get("date") and a["date"] >= week_ago
    )
    monthly_co2 = sum(
        a["co2_kg"] for a in user_activities
        if a.get("date") and a["date"] >= month_ago
    )

    level_info = get_level_progress(current_user.get("xp", 0))
    all_badges = get_all_badges()
    user_badge_ids = set(current_user.get("badges", []))

    badges_earned = [b for b in all_badges if b["id"] in user_badge_ids]
    badges_locked = [b for b in all_badges if b["id"] not in user_badge_ids]

    return {
        "user_id": str(current_user["_id"]),
        "xp": current_user.get("xp", 0),
        "streak": current_user.get("streak", 0),
        "total_carbon_saved": current_user.get("total_carbon_saved", 0.0),
        "eco_level": current_user.get("eco_level", "Eco Beginner"),
        "weekly_co2_kg": round(weekly_co2, 2),
        "monthly_co2_kg": round(monthly_co2, 2),
        "level_progress": level_info,
        "badges_earned": badges_earned,
        "badges_locked": badges_locked[:5],  # Show next 5 to earn
        "activity_count": len(user_activities),
    }
