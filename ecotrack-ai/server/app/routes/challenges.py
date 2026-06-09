from fastapi import APIRouter, Depends, HTTPException
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


class JoinBody(BaseModel):
    challenge_id: str

class CompleteBody(BaseModel):
    user_challenge_id: str


@router.get("/")
async def list_challenges(current_user: dict = Depends(get_current_user)):
    uc_col = get_collection("user_challenges")
    user_challenges = await uc_col.find({"user_id": str(current_user["_id"])}).to_list(100)
    joined = {uc["challenge_id"]: uc for uc in user_challenges}
    result = []
    for ch in get_all_challenges():
        c = ch.copy()
        if ch["id"] in joined:
            uc = joined[ch["id"]]
            c.update({"user_status": uc["status"], "user_challenge_id": str(uc["_id"]),
                      "progress": uc.get("progress", 0),
                      "started_at": uc["started_at"].isoformat() if uc.get("started_at") else None})
        else:
            c.update({"user_status": "available", "user_challenge_id": None, "progress": 0, "started_at": None})
        result.append(c)
    return result


@router.post("/join")
async def join_challenge(body: JoinBody, current_user: dict = Depends(get_current_user)):
    ch = get_challenge_by_id(body.challenge_id)
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    uc_col = get_collection("user_challenges")
    if await uc_col.find_one({"user_id": str(current_user["_id"]), "challenge_id": body.challenge_id, "status": "active"}):
        raise HTTPException(status_code=409, detail="Already joined this challenge.")
    doc = {"user_id": str(current_user["_id"]), "challenge_id": body.challenge_id,
           "challenge_title": ch["title"], "status": "active",
           "started_at": datetime.utcnow(), "completed_at": None, "progress": 0}
    r = await uc_col.insert_one(doc)
    return {"user_challenge_id": str(r.inserted_id), "message": f"Joined: {ch['title']}", "challenge": ch}


@router.post("/complete")
async def complete_challenge(body: CompleteBody, current_user: dict = Depends(get_current_user)):
    uc_col = get_collection("user_challenges")
    users_col = get_collection("users")
    try:
        uc = await uc_col.find_one({"_id": ObjectId(body.user_challenge_id), "user_id": str(current_user["_id"]), "status": "active"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid challenge ID.")
    if not uc:
        raise HTTPException(status_code=404, detail="Active challenge not found.")
    ch = get_challenge_by_id(uc["challenge_id"])
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    xp = XP_REWARDS.get(f"complete_challenge_{ch['difficulty']}", 100)
    await uc_col.update_one({"_id": uc["_id"]}, {"$set": {"status": "completed", "completed_at": datetime.utcnow(), "progress": 100}})
    new_xp = current_user.get("xp", 0) + xp
    await users_col.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"xp": xp, "total_carbon_saved": ch["co2_savings_kg"], "challenges_completed": 1},
         "$set": {"eco_level": get_eco_level_from_xp(new_xp)}}
    )
    updated = await users_col.find_one({"_id": current_user["_id"]})
    new_badges = check_and_award_badges(updated)
    if new_badges:
        await users_col.update_one({"_id": current_user["_id"]}, {"$addToSet": {"badges": {"$each": new_badges}}})
    if ch.get("badge_reward"):
        await users_col.update_one({"_id": current_user["_id"]}, {"$addToSet": {"badges": ch["badge_reward"]}})
    return {"message": f"✅ '{ch['title']}' completed!", "xp_earned": xp,
            "co2_saved_kg": ch["co2_savings_kg"], "new_badges": new_badges}


@router.get("/my")
async def my_challenges(current_user: dict = Depends(get_current_user)):
    uc_col = get_collection("user_challenges")
    challenges = await uc_col.find({"user_id": str(current_user["_id"])}).sort("started_at", -1).limit(20).to_list(20)
    return [{"id": str(c["_id"]), "challenge_id": c["challenge_id"], "title": c["challenge_title"],
             "status": c["status"], "progress": c.get("progress", 0),
             "started_at": c["started_at"].isoformat() if c.get("started_at") else None,
             "completed_at": c["completed_at"].isoformat() if c.get("completed_at") else None} for c in challenges]
