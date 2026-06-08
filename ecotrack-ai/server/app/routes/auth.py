"""Authentication routes — register, login, token refresh."""
from fastapi import APIRouter, HTTPException, status
from datetime import timedelta
from bson import ObjectId
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.config.database import get_collection
from app.config.settings import settings
from app.services.gamification_service import get_eco_level_from_xp
from datetime import datetime
import logging

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


def user_doc_to_response(user: dict) -> UserResponse:
    """Convert MongoDB user document to UserResponse model."""
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
    """Register a new user account."""
    users_collection = get_collection("users")

    # Check if email already exists
    existing = await users_collection.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    # Create new user document
    now = datetime.utcnow()
    new_user = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "password_hash": hash_password(user_data.password),
        "bio": "",
        "location": "",
        "avatar_color": "#10b981",
        "eco_level": "Eco Beginner",
        "xp": 50,  # Welcome bonus XP
        "streak": 0,
        "total_carbon_saved": 0.0,
        "badges": ["first_step"],  # First step badge on register
        "challenges_completed": 0,
        "last_calculation": None,
        "daily_emissions": [],
        "created_at": now,
        "last_active": now,
    }

    result = await users_collection.insert_one(new_user)
    new_user["_id"] = result.inserted_id

    # Generate access token
    access_token = create_access_token(
        data={"sub": str(result.inserted_id)},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )

    logger.info(f"New user registered: {user_data.email}")
    return TokenResponse(
        access_token=access_token,
        user=user_doc_to_response(new_user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate user and return JWT token."""
    users_collection = get_collection("users")

    # Find user by email
    user = await users_collection.find_one({"email": credentials.email.lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Update last active and handle streak
    now = datetime.utcnow()
    last_active = user.get("last_active")
    streak = user.get("streak", 0)

    if last_active:
        days_diff = (now.date() - last_active.date()).days
        if days_diff == 1:
            streak += 1  # Consecutive day
        elif days_diff > 1:
            streak = 1  # Streak broken, reset
        # Same day = no change
    else:
        streak = 1

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_active": now, "streak": streak}}
    )
    user["last_active"] = now
    user["streak"] = streak

    # Generate access token
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )

    logger.info(f"User logged in: {credentials.email}")
    return TokenResponse(
        access_token=access_token,
        user=user_doc_to_response(user)
    )
