from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_handler import verify_token
from app.config.database import get_collection
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    user_id = verify_token(token)
    if not user_id:
        raise credentials_exception
    users_collection = get_collection("users")
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise credentials_exception
    if not user:
        raise credentials_exception
    return user
