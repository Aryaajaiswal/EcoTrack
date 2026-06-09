from fastapi import APIRouter, Depends
from app.models.carbon import CarbonCalculationInput, CarbonCalculationResult, ActivityLogCreate
from app.middleware.auth import get_current_user
from app.services.carbon_service import perform_carbon_calculation
from app.services.gamification_service import get_eco_level_from_xp, check_and_award_badges, XP_REWARDS
from app.config.database import get_collection
from datetime import datetime, timedelta
import logging

router = APIRouter(prefix="/carbon", tags=["Carbon Footprint"])
logger = logging.getLogger(__name__)


@router.post("/calculate", response_model=CarbonCalculationResult)
async def calculate_footprint(data: CarbonCalculationInput, current_user: dict = Depends(get_current_user)):
    result = perform_carbon_calculation(data)
    users_col = get_collection("users")
    xp = XP_REWARDS["carbon_calculation"]
    new_xp = current_user.get("xp", 0) + xp
    await users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"last_calculation": result.dict(), "eco_level": get_eco_level_from_xp(new_xp), "last_active": datetime.utcnow()}, "$inc": {"xp": xp}}
    )
    updated = await users_col.find_one({"_id": current_user["_id"]})
    new_badges = check_and_award_badges(updated)
    if new_badges:
        await users_col.update_one({"_id": current_user["_id"]}, {"$addToSet": {"badges": {"$each": new_badges}}})
    return result


@router.post("/activity")
async def log_activity(activity: ActivityLogCreate, current_user: dict = Depends(get_current_user)):
    activities_col = get_collection("activities")
    doc = {
        "user_id": str(current_user["_id"]), "date": datetime.utcnow(),
        "category": activity.category, "activity_type": activity.activity_type,
        "co2_kg": activity.co2_kg, "description": activity.description,
        "points_earned": XP_REWARDS["log_activity"],
    }
    result = await activities_col.insert_one(doc)
    users_col = get_collection("users")
    await users_col.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"xp": XP_REWARDS["log_activity"], "total_carbon_saved": activity.co2_kg},
         "$set": {"last_active": datetime.utcnow()},
         "$push": {"daily_emissions": {"$each": [activity.co2_kg], "$slice": -90}}}
    )
    return {"id": str(result.inserted_id), "message": "Activity logged successfully", "xp_earned": XP_REWARDS["log_activity"]}


@router.get("/activities")
async def get_activities(limit: int = 20, current_user: dict = Depends(get_current_user)):
    activities_col = get_collection("activities")
    activities = await activities_col.find({"user_id": str(current_user["_id"])}).sort("date", -1).limit(limit).to_list(limit)
    return [{"id": str(a["_id"]), "date": a["date"].isoformat(), "category": a["category"],
             "activity_type": a["activity_type"], "co2_kg": a["co2_kg"],
             "description": a["description"], "points_earned": a.get("points_earned", 0)} for a in activities]


@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    activities_col = get_collection("activities")
    now = datetime.utcnow()
    activities = await activities_col.find(
        {"user_id": str(current_user["_id"]), "date": {"$gte": now - timedelta(days=30)}}
    ).sort("date", 1).to_list(200)

    daily_data = {(now - timedelta(days=6 - i)).strftime("%a"): 0.0 for i in range(7)}
    for a in activities:
        k = a["date"].strftime("%a")
        if k in daily_data:
            daily_data[k] += a["co2_kg"]

    categories = {}
    for a in activities:
        cat = a.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + a["co2_kg"]

    weekly = [0.0, 0.0, 0.0, 0.0]
    for a in activities:
        idx = min(3, (now - a["date"]).days // 7)
        weekly[3 - idx] += a["co2_kg"]

    return {
        "daily_labels": list(daily_data.keys()),
        "daily_values": [round(v, 2) for v in daily_data.values()],
        "category_labels": list(categories.keys()) or ["Transportation", "Home Energy", "Food"],
        "category_values": [round(v, 2) for v in categories.values()] or [0, 0, 0],
        "weekly_labels": ["3 Weeks Ago", "2 Weeks Ago", "Last Week", "This Week"],
        "weekly_values": [round(v, 2) for v in weekly],
        "total_this_month": round(sum(weekly), 2),
        "last_calculation": current_user.get("last_calculation"),
        "daily_avg_kg": round(sum(daily_data.values()) / 7, 2),
    }
