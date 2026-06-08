"""Carbon footprint calculation and activity logging routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.models.carbon import CarbonCalculationInput, CarbonCalculationResult, ActivityLogCreate
from app.middleware.auth import get_current_user
from app.services.carbon_service import perform_carbon_calculation
from app.services.gamification_service import (
    get_eco_level_from_xp, check_and_award_badges, XP_REWARDS
)
from app.config.database import get_collection
from datetime import datetime
import logging

router = APIRouter(prefix="/carbon", tags=["Carbon Footprint"])
logger = logging.getLogger(__name__)


@router.post("/calculate", response_model=CarbonCalculationResult)
async def calculate_footprint(
    data: CarbonCalculationInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Calculate user's carbon footprint and update their profile.
    Awards XP and potentially new badges.
    """
    result = perform_carbon_calculation(data)

    # Update user record
    users_collection = get_collection("users")
    xp_gain = XP_REWARDS["carbon_calculation"]
    new_xp = current_user.get("xp", 0) + xp_gain
    new_eco_level = get_eco_level_from_xp(new_xp)

    # Save calculation to user profile
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "last_calculation": result.dict(),
                "eco_level": new_eco_level,
                "last_active": datetime.utcnow(),
            },
            "$inc": {"xp": xp_gain},
        }
    )

    # Check for new badges
    updated_user = await users_collection.find_one({"_id": current_user["_id"]})
    new_badges = check_and_award_badges(updated_user)
    if new_badges:
        await users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$addToSet": {"badges": {"$each": new_badges}}}
        )

    logger.info(f"Carbon calculation for user {current_user['_id']}: {result.total_co2_kg_per_year} kg/year")
    return result


@router.post("/activity")
async def log_activity(
    activity: ActivityLogCreate,
    current_user: dict = Depends(get_current_user)
):
    """Log a carbon activity entry."""
    activities_collection = get_collection("activities")

    activity_doc = {
        "user_id": str(current_user["_id"]),
        "date": datetime.utcnow(),
        "category": activity.category,
        "activity_type": activity.activity_type,
        "co2_kg": activity.co2_kg,
        "description": activity.description,
        "points_earned": XP_REWARDS["log_activity"],
    }

    result = await activities_collection.insert_one(activity_doc)

    # Update user XP and carbon saved
    users_collection = get_collection("users")
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$inc": {
                "xp": XP_REWARDS["log_activity"],
                "total_carbon_saved": activity.co2_kg,
            },
            "$set": {"last_active": datetime.utcnow()},
            "$push": {
                "daily_emissions": {
                    "$each": [activity.co2_kg],
                    "$slice": -90  # Keep last 90 entries
                }
            }
        }
    )

    return {
        "id": str(result.inserted_id),
        "message": "Activity logged successfully",
        "xp_earned": XP_REWARDS["log_activity"],
    }


@router.get("/activities")
async def get_activities(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's activity history."""
    activities_collection = get_collection("activities")
    activities = await activities_collection.find(
        {"user_id": str(current_user["_id"])}
    ).sort("date", -1).limit(limit).to_list(limit)

    return [
        {
            "id": str(a["_id"]),
            "date": a["date"].isoformat(),
            "category": a["category"],
            "activity_type": a["activity_type"],
            "co2_kg": a["co2_kg"],
            "description": a["description"],
            "points_earned": a.get("points_earned", 0),
        }
        for a in activities
    ]


@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """Get comprehensive analytics for the user's dashboard."""
    from datetime import timedelta

    activities_collection = get_collection("activities")
    now = datetime.utcnow()
    month_ago = now - timedelta(days=30)

    # Get recent activities
    activities = await activities_collection.find(
        {"user_id": str(current_user["_id"]), "date": {"$gte": month_ago}}
    ).sort("date", 1).to_list(200)

    # Build daily breakdown for last 7 days
    daily_data = {}
    for i in range(7):
        day = (now - timedelta(days=6 - i)).strftime("%a")
        daily_data[day] = 0.0

    for a in activities:
        day_key = a["date"].strftime("%a")
        if day_key in daily_data:
            daily_data[day_key] += a["co2_kg"]

    # Category breakdown
    categories = {}
    for a in activities:
        cat = a.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + a["co2_kg"]

    # Monthly trend (last 4 weeks)
    weekly_totals = [0.0, 0.0, 0.0, 0.0]
    for a in activities:
        days_ago = (now - a["date"]).days
        week_idx = min(3, days_ago // 7)
        weekly_totals[3 - week_idx] += a["co2_kg"]

    last_calc = current_user.get("last_calculation")

    return {
        "daily_labels": list(daily_data.keys()),
        "daily_values": [round(v, 2) for v in daily_data.values()],
        "category_labels": list(categories.keys()) or ["Transportation", "Home Energy", "Food"],
        "category_values": [round(v, 2) for v in categories.values()] or [0, 0, 0],
        "weekly_labels": ["3 Weeks Ago", "2 Weeks Ago", "Last Week", "This Week"],
        "weekly_values": [round(v, 2) for v in weekly_totals],
        "total_this_month": round(sum(weekly_totals), 2),
        "last_calculation": last_calc,
        "daily_avg_kg": round(sum(daily_data.values()) / 7, 2) if daily_data else 0,
    }
