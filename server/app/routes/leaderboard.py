from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.config.database import get_collection
import logging

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])
logger = logging.getLogger(__name__)


@router.get("/")
async def get_leaderboard(limit: int = 20, sort_by: str = "xp", current_user: dict = Depends(get_current_user)):
    users_col = get_collection("users")
    field = {"xp": "xp", "streak": "streak", "carbon_saved": "total_carbon_saved"}.get(sort_by, "xp")
    top = await users_col.find({}, {"name": 1, "avatar_color": 1, "eco_level": 1, "xp": 1, "streak": 1, "total_carbon_saved": 1, "badges": 1}).sort(field, -1).limit(limit).to_list(limit)
    me = str(current_user["_id"])
    rank = next((i + 1 for i, u in enumerate(top) if str(u["_id"]) == me), None)
    if rank is None:
        rank = await users_col.count_documents({field: {"$gt": current_user.get(field, 0)}}) + 1
    return {
        "entries": [{"rank": i + 1, "user_id": str(u["_id"]), "name": u.get("name", "Anonymous"),
                     "avatar_color": u.get("avatar_color", "#10b981"), "eco_level": u.get("eco_level", "Eco Beginner"),
                     "xp": u.get("xp", 0), "streak": u.get("streak", 0),
                     "total_carbon_saved": round(u.get("total_carbon_saved", 0.0), 1),
                     "badges_count": len(u.get("badges", [])), "is_current_user": str(u["_id"]) == me}
                    for i, u in enumerate(top)],
        "current_user_rank": rank, "sort_by": sort_by,
        "total_participants": await users_col.count_documents({}),
    }
