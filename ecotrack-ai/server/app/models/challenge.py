"""Challenge and gamification models."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ChallengeDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ChallengeStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


class Challenge(BaseModel):
    id: str
    title: str
    description: str
    category: str
    difficulty: ChallengeDifficulty
    xp_reward: int
    co2_savings_kg: float
    duration_days: int
    badge_reward: Optional[str] = None
    icon: str = "🌱"


class UserChallenge(BaseModel):
    user_id: str
    challenge_id: str
    challenge_title: str
    status: ChallengeStatus = ChallengeStatus.ACTIVE
    started_at: datetime
    completed_at: Optional[datetime] = None
    progress: int = 0  # 0-100


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    name: str
    avatar_color: str
    eco_level: str
    xp: int
    streak: int
    total_carbon_saved: float
    badges_count: int


class Badge(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    xp_required: int
    color: str
