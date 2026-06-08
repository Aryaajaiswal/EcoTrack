"""Eco challenges and gamification routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from app.middleware.auth import get_current_user
from app.services.gamification_service import (
    get_all_challenges, get_challenge_by_id,
    check_and_award_badges, XP_REWARDS, get_eco_level_from_xp
)
from app.config.database import get_collection
from datetime import datetime
import logging

router = APIRouter(prefix="/challenges", tags=["Challenges"])
logger = logging.getLogger(__name__)


class JoinChallengeBody(BaseModel):
    challenge_id: str


class CompleteChallengeBody(BaseModel):
    user_challenge_id: str


@router.get("/")
async def list_challenges(current_user: dict = Depends(get_current_user)):
    """Get all available challenges with user's current status."""
    user_id = str(current_user["_id"])
    user_challenges_col = get_collection("user_challenges")

    # Get user's active/completed challenges
    user_challenges = await user_challenges_col.find(
        {"user_id": user_id}
    ).to_list(100)

    joined_ids = {uc["challenge_id"]: uc for uc in user_challenges}
    all_challenges = get_all_challenges()

    result = []
    for ch in all_challenges:
        ch_copy = ch.copy()
        if ch["id"] in joined_ids:
            uc = joined_ids[ch["id"]]
            ch_copy["user_status"] = uc["status"]
            ch_copy["user_challenge_id"] = str(uc["_id"])
            ch_copy["progress"] = uc.get("progress", 0)
            ch_copy["started_at"] = uc.get("started_at", "").isoformat() if uc.get("started_at") else None
        else:
            ch_copy["user_status"] = "available"
            ch_copy["user_challenge_id"] = None
            ch_copy["progress"] = 0
            ch_copy["started_at"] = None
        result.append(ch_copy)

    return result


@router.post("/join")
async def join_challenge(
    body: JoinChallengeBody,
    current_user: dict = Depends(get_current_user)
):
    """Join an eco challenge."""
    challenge = get_challenge_by_id(body.challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    user_id = str(current_user["_id"])
    user_challenges_col = get_collection("user_challenges")

    # Check if already joined
    existing = await user_challenges_col.find_one({
        "user_id": user_id,
        "challenge_id": body.challenge_id,
        "status": "active"
    })
    if existing:
        raise HTTPException(status_code=409, detail="You have already joined this challenge.")

    doc = {
        "user_id": user_id,
        "challenge_id": body.challenge_id,
        "challenge_title": challenge["title"],
        "status": "active",
        "started_at": datetime.utcnow(),
        "completed_at": None,
        "progress": 0,
    }
    result = await user_challenges_col.insert_one(doc)

    return {
        "user_challenge_id": str(result.inserted_id),
        "message": f"Joined challenge: {challenge['title']}",
        "challenge": challenge,
    }


@router.post("/complete")
async def complete_challenge(
    body: CompleteChallengeBody,
    current_user: dict = Depends(get_current_user)
):
    """Mark a challenge as completed and award XP."""
    user_challenges_col = get_collection("user_challenges")
    users_collection = get_collection("users")

    try:
        uc = await user_challenges_col.find_one({
            "_id": ObjectId(body.user_challenge_id),
            "user_id": str(current_user["_id"]),
            "status": "active"
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid challenge ID.")

    if not uc:
        raise HTTPException(status_code=404, detail="Active challenge not found.")

    challenge = get_challenge_by_id(uc["challenge_id"])
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge definition not found.")

    # Award XP based on difficulty
    difficulty_key = f"complete_challenge_{challenge['difficulty']}"
    xp_award = XP_REWARDS.get(difficulty_key, 100)

    # Mark complete
    await user_challenges_col.update_one(
        {"_id": uc["_id"]},
        {"$set": {"status": "completed", "completed_at": datetime.utcnow(), "progress": 100}}
    )

    # Update user stats
    new_xp = current_user.get("xp", 0) + xp_award
    new_eco_level = get_eco_level_from_xp(new_xp)

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$inc": {
                "xp": xp_award,
                "total_carbon_saved": challenge["co2_savings_kg"],
                "challenges_completed": 1,
            },
            "$set": {"eco_level": new_eco_level}
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

    # Add badge from challenge definition if any
    if challenge.get("badge_reward"):
        await users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$addToSet": {"badges": challenge["badge_reward"]}}
        )
        if challenge["badge_reward"] not in new_badges:
            new_badges.append(challenge["badge_reward"])

    return {
        "message": f"Challenge '{challenge['title']}' completed! 🎉",
        "xp_earned": xp_award,
        "co2_saved_kg": challenge["co2_savings_kg"],
        "new_badges": new_badges,
        "new_eco_level": new_eco_level,
    }


@router.get("/my")
async def get_my_challenges(current_user: dict = Depends(get_current_user)):
    """Get current user's challenge history."""
    user_challenges_col = get_collection("user_challenges")
    challenges = await user_challenges_col.find(
        {"user_id": str(current_user["_id"])}
    ).sort("started_at", -1).limit(20).to_list(20)

    return [
        {
            "id": str(c["_id"]),
            "challenge_id": c["challenge_id"],
            "title": c["challenge_title"],
            "status": c["status"],
            "progress": c.get("progress", 0),
            "started_at": c["started_at"].isoformat() if c.get("started_at") else None,
            "completed_at": c["completed_at"].isoformat() if c.get("completed_at") else None,
        }
        for c in challenges
    ]
