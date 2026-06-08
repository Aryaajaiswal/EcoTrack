"""AI Sustainability Coach routes."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from app.services.ai_service import (
    generate_chat_response, get_daily_tips,
    predict_future_emissions, generate_weekly_forecast,
    get_ai_insight, get_greeting
)
import logging

router = APIRouter(prefix="/ai", tags=["AI Coach"])
logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    message: str


@router.post("/chat")
async def chat_with_coach(
    body: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    """Send a message to the AI sustainability coach."""
    user_context = {
        "name": current_user.get("name", ""),
        "eco_level": current_user.get("eco_level", "Eco Beginner"),
        "xp": current_user.get("xp", 0),
        "streak": current_user.get("streak", 0),
        "last_calc": current_user.get("last_calculation"),
    }

    response = generate_chat_response(body.message, user_context)

    return {
        "message": response,
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }


@router.get("/tips")
async def get_tips(
    count: int = 3,
    current_user: dict = Depends(get_current_user)
):
    """Get personalized daily eco tips."""
    tips = get_daily_tips(min(count, 5))
    return {"tips": tips}


@router.get("/insight")
async def get_insight(current_user: dict = Depends(get_current_user)):
    """Get a personalized AI insight for the current user."""
    last_calc = current_user.get("last_calculation", {})
    carbon_score = last_calc.get("total_co2_kg_per_year", 4700) if last_calc else 4700

    insight = get_ai_insight(
        carbon_score=carbon_score,
        eco_level=current_user.get("eco_level", "Eco Beginner"),
        streak=current_user.get("streak", 0),
        xp=current_user.get("xp", 0),
    )

    greeting = get_greeting(current_user.get("name", ""))

    return {
        "greeting": greeting,
        "insight": insight,
        "name": current_user.get("name", "").split()[0],
    }


@router.get("/predictions")
async def get_predictions(
    months: int = 12,
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered future emission predictions."""
    last_calc = current_user.get("last_calculation", {})
    current_annual = last_calc.get("total_co2_kg_per_year", 4700) if last_calc else 4700

    predictions = predict_future_emissions(
        current_annual_co2=current_annual,
        sustainability_score=last_calc.get("sustainability_score", 50) if last_calc else 50,
        streak=current_user.get("streak", 0),
        months=min(months, 24),
    )
    return predictions


@router.get("/forecast")
async def get_weekly_forecast(current_user: dict = Depends(get_current_user)):
    """Get a 7-day emission forecast."""
    daily_emissions = current_user.get("daily_emissions", [])
    forecast = generate_weekly_forecast(daily_emissions)
    return forecast
