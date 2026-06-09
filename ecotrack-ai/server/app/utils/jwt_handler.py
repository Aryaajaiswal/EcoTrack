from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        return None

def verify_token(token: str) -> Optional[str]:
    payload = decode_access_token(token)
    return payload.get("sub") if payload else None
