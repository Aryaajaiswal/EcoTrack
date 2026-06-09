from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EcoLevel(str, Enum):
    ECO_BEGINNER = "Eco Beginner"
    AWARE_CITIZEN = "Aware Citizen"
    GREEN_WARRIOR = "Green Warrior"
    CLIMATE_HERO = "Climate Hero"

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    bio: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=100)
    avatar_color: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    bio: Optional[str] = ""
    location: Optional[str] = ""
    avatar_color: Optional[str] = "#10b981"
    eco_level: str = EcoLevel.ECO_BEGINNER
    xp: int = 0
    streak: int = 0
    total_carbon_saved: float = 0.0
    badges: List[str] = []
    created_at: datetime
    last_active: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
