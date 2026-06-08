"""Global leaderboard routes."""
from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.config.database import get_collection
import logging

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])
logger = logging.getLogger(__name__)


@router.get("/")
async def get_leaderboard(
    limit: int = 20,
    sort_by: str = "xp",  # xp | streak | carbon_saved
    current_user: dict = Depends(get_current_user)
):
    """Get the global leaderboard."""
    users_collection = get_collection("users")

    # Sort field mapping
    sort_field_map = {
        "xp": "xp",
        "streak": "streak",
        "carbon_saved": "total_carbon_saved",
    }
    sort_field = sort_field_map.get(sort_by, "xp")

    # Fetch top users
    top_users = await users_collection.find(
        {},
        {
            "name": 1, "avatar_color": 1, "eco_level": 1,
            "xp": 1, "streak": 1, "total_carbon_saved": 1, "badges": 1
        }
    ).sort(sort_field, -1).limit(limit).to_list(limit)

    # Find current user's rank
    current_user_id = str(current_user["_id"])
    user_rank = None

    for i, u in enumerate(top_users):
        if str(u["_id"]) == current_user_id:
            user_rank = i + 1
            break

    if user_rank is None:
        # Count users with higher score
        higher_count = await users_collection.count_documents(
            {sort_field: {"$gt": current_user.get(sort_field, 0)}}
        )
        user_rank = higher_count + 1

    result = []
    for i, u in enumerate(top_users):
        result.append({
            "rank": i + 1,
            "user_id": str(u["_id"]),
            "name": u.get("name", "Anonymous"),
            "avatar_color": u.get("avatar_color", "#10b981"),
            "eco_level": u.get("eco_level", "Eco Beginner"),
            "xp": u.get("xp", 0),
            "streak": u.get("streak", 0),
            "total_carbon_saved": round(u.get("total_carbon_saved", 0.0), 1),
            "badges_count": len(u.get("badges", [])),
            "is_current_user": str(u["_id"]) == current_user_id,
        })

    return {
        "entries": result,
        "current_user_rank": user_rank,
        "sort_by": sort_by,
        "total_participants": await users_collection.count_documents({}),
    }
