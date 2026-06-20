from fastapi import APIRouter, HTTPException, status, Query
from datetime import timedelta, datetime
from bson import ObjectId
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import create_access_token, decode_access_token
from app.config.database import get_collection
from app.config.settings import settings
from app.services.notification_service import create_notification
from app.services.gamification_service import BADGES
import logging, secrets

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


@router.get("/verify-email")
async def verify_email(token: str = Query(...)):
    payload = decode_access_token(token)
    if not payload or payload.get("type") != "email_verify":
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    users = get_collection("users")
    result = await users.update_one({"_id": ObjectId(payload["sub"])}, {"$set": {"email_verified": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Email verified successfully"}

@router.post("/resend-verification")
async def resend_verification(data: dict):
    email = data.get("email", "").lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    users = get_collection("users")
    user = await users.find_one({"email": email})
    if not user:
        return {"message": "If the email exists, a verification link has been sent"}
    token = create_access_token({"sub": str(user["_id"]), "type": "email_verify"}, timedelta(hours=24))
    logger.info(f"Verification token for {email}: {settings.frontend_url}/verify-email?token={token}")
    return {"message": "If the email exists, a verification link has been sent", "token": token}

@router.post("/forgot-password")
async def forgot_password(data: dict):
    email = data.get("email", "").lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    users = get_collection("users")
    user = await users.find_one({"email": email})
    if not user:
        return {"message": "If the email exists, a reset link has been sent"}
    token = create_access_token({"sub": str(user["_id"]), "type": "password_reset"}, timedelta(hours=1))
    await users.update_one({"_id": user["_id"]}, {"$set": {"reset_token": token}})
    logger.info(f"Password reset token for {email}: {settings.frontend_url}/reset-password?token={token}")
    return {"message": "If the email exists, a reset link has been sent", "token": token}

@router.post("/reset-password")
async def reset_password(data: dict):
    token = data.get("token", "")
    new_password = data.get("password", "")
    if not token or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Invalid token or password too short (min 6 chars)")
    payload = decode_access_token(token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    users = get_collection("users")
    user = await users.find_one({"_id": ObjectId(payload["sub"]), "reset_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    await users.update_one({"_id": user["_id"]}, {"$set": {"password_hash": hash_password(new_password)}, "$unset": {"reset_token": ""}})
    return {"message": "Password reset successfully"}

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
    if streak in [7, 30]:
        badge_id = "eco_week" if streak == 7 else "streak_legend"
        badge = next((b for b in BADGES if b["id"] == badge_id), None)
        if badge:
            await create_notification(str(user["_id"]), "streak_milestone", "Streak Milestone!",
                f"You've reached a {streak}-day streak! {badge['icon']}", {"streak": streak})
    user["last_active"] = now
    user["streak"] = streak
    token = create_access_token({"sub": str(user["_id"])}, timedelta(minutes=settings.access_token_expire_minutes))
    return TokenResponse(access_token=token, user=user_doc_to_response(user))
