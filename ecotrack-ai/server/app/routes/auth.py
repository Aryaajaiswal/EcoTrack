from fastapi import APIRouter, HTTPException, status
from datetime import timedelta, datetime
from bson import ObjectId
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.config.database import get_collection
from app.config.settings import settings
import logging

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


def user_doc_to_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        bio=user.get("bio", ""),
        location=user.get("location", ""),
        avatar_color=user.get("avatar_color", "#10b981"),
        eco_level=user.get("eco_level", "Eco Beginner"),
        xp=user.get("xp", 0),
        streak=user.get("streak", 0),
        total_carbon_saved=user.get("total_carbon_saved", 0.0),
        badges=user.get("badges", []),
        created_at=user.get("created_at", datetime.utcnow()),
        last_active=user.get("last_active"),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    users_collection = get_collection("users")
    existing = await users_collection.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    now = datetime.utcnow()
    new_user = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "password_hash": hash_password(user_data.password),
        "bio": "", "location": "", "avatar_color": "#10b981",
        "eco_level": "Eco Beginner", "xp": 50, "streak": 0,
        "total_carbon_saved": 0.0, "badges": ["first_step"],
        "challenges_completed": 0, "last_calculation": None,
        "daily_emissions": [], "created_at": now, "last_active": now,
    }
    result = await users_collection.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    token = create_access_token({"sub": str(result.inserted_id)}, timedelta(minutes=settings.access_token_expire_minutes))
    return TokenResponse(access_token=token, user=user_doc_to_response(new_user))


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    users_collection = get_collection("users")
    user = await users_collection.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    now = datetime.utcnow()
    last_active = user.get("last_active")
    streak = user.get("streak", 0)
    if last_active:
        diff = (now.date() - last_active.date()).days
        streak = streak + 1 if diff == 1 else (1 if diff > 1 else streak)
    else:
        streak = 1
    await users_collection.update_one({"_id": user["_id"]}, {"$set": {"last_active": now, "streak": streak}})
    user["last_active"] = now
    user["streak"] = streak
    token = create_access_token({"sub": str(user["_id"])}, timedelta(minutes=settings.access_token_expire_minutes))
    return TokenResponse(access_token=token, user=user_doc_to_response(user))
