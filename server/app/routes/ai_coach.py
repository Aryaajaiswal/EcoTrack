from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from app.services.ai_service import (
    generate_chat_response, get_daily_tips,
    predict_future_emissions, generate_weekly_forecast,
    get_ai_insight, get_greeting
)
from datetime import datetime
import logging

router = APIRouter(prefix="/ai", tags=["AI Coach"])
logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    message: str


@router.post("/chat")
async def chat(body: ChatMessage, current_user: dict = Depends(get_current_user)):
    ctx = {"name": current_user.get("name", ""), "eco_level": current_user.get("eco_level", "Eco Beginner"),
           "xp": current_user.get("xp", 0), "streak": current_user.get("streak", 0)}
    return {"message": generate_chat_response(body.message, ctx), "timestamp": datetime.utcnow().isoformat()}


@router.get("/tips")
async def tips(count: int = 3, current_user: dict = Depends(get_current_user)):
    return {"tips": get_daily_tips(min(count, 5))}


@router.get("/insight")
async def insight(current_user: dict = Depends(get_current_user)):
    calc = current_user.get("last_calculation") or {}
    score = calc.get("total_co2_kg_per_year", 4700)
    return {
        "greeting": get_greeting(current_user.get("name", "")),
        "insight": get_ai_insight(score, current_user.get("eco_level", "Eco Beginner"),
                                  current_user.get("streak", 0), current_user.get("xp", 0)),
        "name": current_user.get("name", "").split()[0],
    }


@router.get("/predictions")
async def predictions(months: int = 12, current_user: dict = Depends(get_current_user)):
    calc = current_user.get("last_calculation") or {}
    return predict_future_emissions(
        current_annual_co2=calc.get("total_co2_kg_per_year", 4700),
        sustainability_score=calc.get("sustainability_score", 50),
        streak=current_user.get("streak", 0),
        months=min(months, 24),
    )


@router.get("/forecast")
async def forecast(current_user: dict = Depends(get_current_user)):
    return generate_weekly_forecast(current_user.get("daily_emissions", []))
