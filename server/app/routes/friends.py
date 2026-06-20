from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.config.database import get_collection
from app.services.notification_service import create_notification
from bson import ObjectId
import logging

router = APIRouter(prefix="/friends", tags=["Friends"])
logger = logging.getLogger(__name__)

@router.post("/request")
async def send_friend_request(data: dict, user: dict = Depends(get_current_user)):
    target_email = data.get("email", "").lower().strip()
    if not target_email:
        raise HTTPException(status_code=400, detail="Email is required")
    users = get_collection("users")
    target = await users.find_one({"email": target_email})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if str(target["_id"]) == str(user["_id"]):
        raise HTTPException(status_code=400, detail="Cannot add yourself")

    friends = get_collection("friends")
    existing = await friends.find_one({
        "$or": [
            {"from_id": ObjectId(user["_id"]), "to_id": target["_id"]},
            {"from_id": target["_id"], "to_id": ObjectId(user["_id"])},
        ]
    })
    if existing:
        if existing["status"] == "accepted":
            raise HTTPException(status_code=400, detail="Already friends")
        elif existing["status"] == "pending":
            raise HTTPException(status_code=400, detail="Request already sent")
        else:
            await friends.delete_one({"_id": existing["_id"]})

    result = await friends.insert_one({
        "from_id": ObjectId(user["_id"]),
        "to_id": target["_id"],
        "status": "pending",
        "created_at": __import__("datetime").datetime.utcnow(),
    })
    await create_notification(
        str(target["_id"]), "friend_request",
        f"Friend Request",
        f"{user['name']} sent you a friend request",
        {"from_user_id": str(user["_id"]), "from_user_name": user["name"]},
    )
    return {"message": "Friend request sent", "friend_id": str(result.inserted_id)}

@router.post("/respond/{friend_id}")
async def respond_request(friend_id: str, data: dict, user: dict = Depends(get_current_user)):
    accept = data.get("accept", True)
    friends = get_collection("friends")
    req = await friends.find_one({"_id": ObjectId(friend_id), "to_id": ObjectId(user["_id"]), "status": "pending"})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if accept:
        await friends.update_one({"_id": req["_id"]}, {"$set": {"status": "accepted"}})
        users = get_collection("users")
        from_user = await users.find_one({"_id": req["from_id"]})
        if from_user:
            await create_notification(
                str(req["from_id"]), "friend_accepted",
                "Friend Request Accepted",
                f"{user['name']} accepted your friend request",
                {"friend_user_id": str(user["_id"]), "friend_name": user["name"]},
            )
        return {"message": "Friend request accepted"}
    else:
        await friends.delete_one({"_id": req["_id"]})
        return {"message": "Friend request rejected"}

@router.delete("/{friend_id}")
async def remove_friend(friend_id: str, user: dict = Depends(get_current_user)):
    friends = get_collection("friends")
    result = await friends.delete_one({
        "$or": [
            {"from_id": ObjectId(user["_id"]), "to_id": ObjectId(friend_id)},
            {"from_id": ObjectId(friend_id), "to_id": ObjectId(user["_id"])},
        ],
        "status": "accepted",
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Friend not found")
    return {"message": "Friend removed"}

@router.get("/")
async def list_friends(user: dict = Depends(get_current_user)):
    friends = get_collection("friends")
    pipeline = [
        {"$match": {"$or": [{"from_id": ObjectId(user["_id"])}, {"to_id": ObjectId(user["_id"])}], "status": "accepted"}},
    ]
    cursor = friends.aggregate(pipeline)
    rels = await cursor.to_list(length=100)
    user_ids = set()
    for r in rels:
        uid = str(r["from_id"]) if str(r["to_id"]) == str(user["_id"]) else str(r["to_id"])
        user_ids.add(uid)

    users = get_collection("users")
    friend_list = []
    for uid in user_ids:
        u = await users.find_one({"_id": ObjectId(uid)}, {"password_hash": 0})
        if u:
            friend_list.append({
                "id": str(u["_id"]),
                "name": u["name"],
                "email": u["email"],
                "bio": u.get("bio", ""),
                "avatar_color": u.get("avatar_color", "#10b981"),
                "eco_level": u.get("eco_level", "Eco Beginner"),
                "xp": u.get("xp", 0),
                "streak": u.get("streak", 0),
            })
    return {"friends": friend_list}

@router.get("/requests")
async def pending_requests(user: dict = Depends(get_current_user)):
    friends = get_collection("friends")
    cursor = friends.find({"to_id": ObjectId(user["_id"]), "status": "pending"})
    reqs = await cursor.to_list(length=50)
    users = get_collection("users")
    result = []
    for r in reqs:
        u = await users.find_one({"_id": r["from_id"]}, {"password_hash": 0})
        if u:
            result.append({
                "id": str(r["_id"]),
                "from_user": {
                    "id": str(u["_id"]),
                    "name": u["name"],
                    "email": u["email"],
                    "avatar_color": u.get("avatar_color", "#10b981"),
                    "eco_level": u.get("eco_level", "Eco Beginner"),
                },
                "created_at": r.get("created_at").isoformat() if r.get("created_at") else None,
            })
    return {"requests": result}

@router.get("/search")
async def search_users(q: str = "", user: dict = Depends(get_current_user)):
    if not q or len(q) < 2:
        return {"users": []}
    users = get_collection("users")
    cursor = users.find({
        "$and": [
            {"_id": {"$ne": ObjectId(user["_id"])}},
            {"$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"email": {"$regex": q, "$options": "i"}},
            ]},
        ]
    }, {"password_hash": 0}).limit(20)
    results = await cursor.to_list(length=20)
    return {"users": [{
        "id": str(u["_id"]), "name": u["name"], "email": u["email"],
        "avatar_color": u.get("avatar_color", "#10b981"),
        "eco_level": u.get("eco_level", "Eco Beginner"),
        "xp": u.get("xp", 0),
    } for u in results]}
