"""
AI Sustainability Coach Service.
Uses intelligent rule-based logic + lightweight ML patterns to generate
personalized sustainability recommendations and predictions.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import random
import logging

logger = logging.getLogger(__name__)

# --- AI Coach Message Templates ---

GREETING_TEMPLATES = [
    "Hey {name}! Your eco-journey is inspiring 🌿 Here's what I noticed about your habits today.",
    "Great to see you, {name}! Let's continue building your sustainable future 🌍",
    "Hello {name}! I've analyzed your recent activity — here are your personalized insights ✨",
    "Welcome back, {name}! You're making a real difference. Let's keep the momentum going! 🚀",
]

DAILY_TIPS = [
    {
        "tip": "Unplug chargers when not in use — vampire power drains add up to 10% of your electricity bill.",
        "category": "Energy",
        "impact": "saves ~50 kg CO₂/year",
        "icon": "⚡"
    },
    {
        "tip": "Try a 'Meatless Monday' — one plant-based day per week reduces food emissions by 14%.",
        "category": "Food",
        "impact": "saves ~350 kg CO₂/year",
        "icon": "🥦"
    },
    {
        "tip": "Cold water washing saves up to 90% of laundry energy — your clothes will thank you too!",
        "category": "Home",
        "impact": "saves ~30 kg CO₂/year",
        "icon": "🧺"
    },
    {
        "tip": "Walk or cycle for trips under 3km — no emissions, and great for your health.",
        "category": "Transport",
        "impact": "saves ~100 kg CO₂/year",
        "icon": "🚴"
    },
    {
        "tip": "Bring your own reusable cup to coffee shops — most offer discounts too!",
        "category": "Shopping",
        "impact": "saves ~15 kg CO₂/year",
        "icon": "☕"
    },
    {
        "tip": "Plant a tree! A single tree absorbs ~21 kg of CO₂ per year over its lifetime.",
        "category": "Lifestyle",
        "impact": "absorbs ~21 kg CO₂/year",
        "icon": "🌳"
    },
    {
        "tip": "Use a smart power strip to eliminate standby power waste from multiple devices.",
        "category": "Energy",
        "impact": "saves ~40 kg CO₂/year",
        "icon": "🔌"
    },
    {
        "tip": "Buy local and seasonal produce — it uses far less transport and storage energy.",
        "category": "Food",
        "impact": "saves ~200 kg CO₂/year",
        "icon": "🥕"
    },
    {
        "tip": "Fix leaky faucets! A dripping tap wastes 15 liters/day and adds to water treatment emissions.",
        "category": "Water",
        "impact": "saves ~5 kg CO₂/year",
        "icon": "💧"
    },
    {
        "tip": "Opt for digital receipts and statements — paper production is surprisingly carbon-heavy.",
        "category": "Lifestyle",
        "impact": "saves ~10 kg CO₂/year",
        "icon": "📱"
    },
]

CHALLENGE_SUGGESTIONS = [
    {
        "title": "Zero Plastic Week",
        "description": "Avoid all single-use plastic for 7 days",
        "difficulty": "medium",
        "xp": 150,
        "co2_savings": 5.0,
        "icon": "🚫🧴",
        "duration_days": 7
    },
    {
        "title": "Cycle Commuter",
        "description": "Bike or walk to work/errands for 5 days",
        "difficulty": "medium",
        "xp": 200,
        "co2_savings": 12.0,
        "icon": "🚲",
        "duration_days": 5
    },
    {
        "title": "Plant-Based Week",
        "description": "Eat fully plant-based for 7 days",
        "difficulty": "hard",
        "xp": 300,
        "co2_savings": 20.0,
        "icon": "🥗",
        "duration_days": 7
    },
    {
        "title": "Energy Saver",
        "description": "Reduce electricity usage by 20% this week",
        "difficulty": "easy",
        "xp": 100,
        "co2_savings": 8.0,
        "icon": "💡",
        "duration_days": 7
    },
    {
        "title": "Digital Detox Day",
        "description": "Reduce screen time by 50% for 1 day",
        "difficulty": "easy",
        "xp": 75,
        "co2_savings": 2.0,
        "icon": "📵",
        "duration_days": 1
    },
    {
        "title": "Local Shopper",
        "description": "Buy only local products for 2 weeks",
        "difficulty": "medium",
        "xp": 180,
        "co2_savings": 15.0,
        "icon": "🏪",
        "duration_days": 14
    },
    {
        "title": "Cold Shower Challenge",
        "description": "Take cold/lukewarm showers for 5 days",
        "difficulty": "hard",
        "xp": 250,
        "co2_savings": 10.0,
        "icon": "🚿",
        "duration_days": 5
    },
    {
        "title": "Composting Starter",
        "description": "Start composting food scraps for 2 weeks",
        "difficulty": "easy",
        "xp": 120,
        "co2_savings": 6.0,
        "icon": "🌱",
        "duration_days": 14
    },
]


def get_greeting(user_name: str) -> str:
    """Get a personalized greeting."""
    template = random.choice(GREETING_TEMPLATES)
    return template.format(name=user_name.split()[0])


def get_daily_tip() -> dict:
    """Get a random daily eco tip."""
    return random.choice(DAILY_TIPS)


def get_daily_tips(count: int = 3) -> List[dict]:
    """Get multiple unique daily tips."""
    return random.sample(DAILY_TIPS, min(count, len(DAILY_TIPS)))


def get_ai_insight(carbon_score: float, eco_level: str, streak: int, xp: int) -> str:
    """Generate a personalized AI insight based on user data."""
    insights = []

    if streak >= 7:
        insights.append(f"🔥 Amazing! You've maintained a {streak}-day eco streak. Your consistency is reducing emissions by an estimated {streak * 0.8:.1f} kg CO₂!")
    elif streak >= 3:
        insights.append(f"📈 You're on a {streak}-day streak! Keep going — 7-day streaks unlock the Green Warrior badge.")
    else:
        insights.append("💪 Start a daily streak by logging your activities — even small actions count toward your goals!")

    if carbon_score < 2000:
        insights.append(f"🌟 Your annual footprint of {carbon_score:.0f} kg CO₂ is {((4700 - carbon_score) / 4700 * 100):.0f}% below the global average. Incredible work!")
    elif carbon_score < 4700:
        savings = 4700 - carbon_score
        insights.append(f"✅ You're already {savings:.0f} kg below the global average! Reducing transport once more per week could push you to the next level.")
    else:
        excess = carbon_score - 4700
        insights.append(f"🎯 You're {excess:.0f} kg above the global average. Focus on transport and food habits first — they have the biggest impact.")

    if eco_level == "Climate Hero":
        insights.append("🏆 You're a Climate Hero — consider mentoring others or joining community eco-projects to amplify your impact!")
    elif eco_level == "Green Warrior":
        insights.append("⚡ You're almost at Climate Hero status! Eliminate one more high-emission habit to level up.")

    return " ".join(insights[:2])


def generate_chat_response(message: str, user_context: dict) -> str:
    """
    Generate an AI coach response to a user message.
    Uses keyword matching and context-aware responses.
    """
    message_lower = message.lower()
    name = user_context.get("name", "there").split()[0]

    # Transport queries
    if any(word in message_lower for word in ["car", "drive", "transport", "commute", "flight", "travel"]):
        return (
            f"Great question, {name}! Transport typically accounts for 30-40% of personal carbon footprints. "
            "The most impactful change is reducing car travel — switching to public transport or an EV can cut "
            "transport emissions by 60-80%. For flights, each long-haul trip adds ~990 kg CO₂. "
            "Consider video calls and train travel as alternatives. Would you like me to calculate your transport impact? 🚗"
        )

    # Food queries
    elif any(word in message_lower for word in ["food", "eat", "diet", "meat", "vegan", "vegetarian"]):
        return (
            f"Food choices are powerful, {name}! A plant-based diet produces 50% fewer emissions than a meat-heavy one. "
            "If you eat meat, try 'Meatless Mondays' — just one plant-based day per week saves ~350 kg CO₂/year. "
            "Also, buying local and seasonal produce dramatically cuts transport and refrigeration emissions. "
            "Your food score looks great — keep exploring plant-rich meals! 🥦"
        )

    # Energy queries
    elif any(word in message_lower for word in ["energy", "electricity", "solar", "power", "ac", "heating"]):
        return (
            f"Home energy is often one of the biggest opportunities, {name}! "
            "Switching to renewable energy can eliminate 1-3 tonnes of CO₂ annually. "
            "In the meantime: LED lighting, smart thermostats, and unplugging devices can cut energy use by 25%. "
            "If you use AC heavily, consider a programmable timer — it's one of the quickest wins. ⚡☀️"
        )

    # Progress/score queries
    elif any(word in message_lower for word in ["score", "progress", "level", "xp", "badge", "improve"]):
        level = user_context.get("eco_level", "Eco Beginner")
        xp = user_context.get("xp", 0)
        return (
            f"You're doing brilliantly, {name}! As a {level} with {xp} XP, you're already making a difference. "
            "To level up faster: complete daily challenges (+75-300 XP each), maintain your streak (+10 XP/day), "
            "and log activities regularly. The next badge is closer than you think — I believe in you! 🏆✨"
        )

    # Challenge queries
    elif any(word in message_lower for word in ["challenge", "mission", "task", "goal"]):
        return (
            f"Challenges are the fastest way to earn XP and reduce your footprint, {name}! "
            "I recommend starting with 'Energy Saver' (easy, +100 XP) or 'Zero Plastic Week' (+150 XP). "
            "Each completed challenge logs real CO₂ savings to your profile. "
            "Ready to accept a challenge? Head to the Challenges tab and pick one that fits your lifestyle! 🌿"
        )

    # Generic eco help
    elif any(word in message_lower for word in ["help", "how", "what", "tip", "advice", "suggest"]):
        tip = random.choice(DAILY_TIPS)
        return (
            f"Here's a tip tailored for you, {name}: {tip['tip']} "
            f"This small change {tip['impact']}. "
            "Would you like more tips for a specific area like transport, food, or energy? Just ask! 🌱"
        )

    # Greeting
    elif any(word in message_lower for word in ["hello", "hi", "hey", "good morning", "good evening"]):
        return get_greeting(user_context.get("name", "eco friend"))

    # Default response
    else:
        responses = [
            f"I'm here to help you on your sustainability journey, {name}! You can ask me about reducing transport emissions, improving your diet's carbon impact, saving energy at home, or understanding your score. What would you like to explore? 🌍",
            f"That's an interesting question, {name}! The best sustainability improvements start with understanding your biggest impact areas. Based on typical profiles, focusing on transport and food habits delivers the most significant reductions. What aspect would you like to dive into? ♻️",
            f"Great to chat, {name}! Your eco journey is personal and powerful. I can help you set goals, understand your footprint, find challenges, or just share daily tips. What's on your mind today? 🌿",
        ]
        return random.choice(responses)


def predict_future_emissions(
    current_annual_co2: float,
    sustainability_score: int,
    streak: int,
    months: int = 12
) -> Dict:
    """
    Predict future carbon footprint trajectory using trend modeling.
    Returns monthly predictions with improvement scenarios.
    """
    # Base monthly emissions
    base_monthly = current_annual_co2 / 12

    # Calculate improvement rate based on engagement
    base_improvement_rate = 0.005  # 0.5% per month baseline
    streak_bonus = min(streak * 0.001, 0.02)  # Up to 2% from streak
    score_bonus = (sustainability_score / 100) * 0.01  # Score-based bonus
    monthly_improvement = base_improvement_rate + streak_bonus + score_bonus

    # Generate predictions for current trajectory
    current_trajectory = []
    optimistic_trajectory = []
    pessimistic_trajectory = []

    labels = []
    now = datetime.now()

    monthly_co2 = base_monthly
    opt_monthly = base_monthly
    pess_monthly = base_monthly

    for i in range(months):
        month_date = now + timedelta(days=30 * i)
        labels.append(month_date.strftime("%b %Y"))

        # Add some realistic variation (±5%)
        variation = 1 + random.uniform(-0.05, 0.05)

        current_trajectory.append(round(monthly_co2 * variation, 1))
        optimistic_trajectory.append(round(opt_monthly * (1 - monthly_improvement * 1.5) * variation, 1))
        pessimistic_trajectory.append(round(pess_monthly * (1 + monthly_improvement * 0.5) * variation, 1))

        # Apply improvement for next month
        monthly_co2 *= (1 - monthly_improvement)
        opt_monthly *= (1 - monthly_improvement * 1.5)
        pess_monthly *= (1 + monthly_improvement * 0.3)

    # Calculate annual prediction
    current_annual_predicted = sum(current_trajectory)
    optimistic_annual = sum(optimistic_trajectory)

    return {
        "labels": labels,
        "current_trajectory": current_trajectory,
        "optimistic_trajectory": optimistic_trajectory,
        "pessimistic_trajectory": pessimistic_trajectory,
        "current_annual_predicted": round(current_annual_predicted, 1),
        "optimistic_annual": round(optimistic_annual, 1),
        "potential_annual_savings": round(current_annual_predicted - optimistic_annual, 1),
        "improvement_rate_monthly_pct": round(monthly_improvement * 100, 2),
        "forecast_confidence": min(95, 60 + sustainability_score * 0.35),
    }


def generate_weekly_forecast(daily_emissions: List[float]) -> Dict:
    """Generate a weekly emissions forecast based on recent data."""
    if not daily_emissions or len(daily_emissions) < 3:
        # Generate sample data if insufficient history
        daily_emissions = [random.uniform(8, 18) for _ in range(14)]

    # Use simple moving average + trend
    arr = np.array(daily_emissions[-14:])  # Last 2 weeks
    trend = np.polyfit(range(len(arr)), arr, 1)[0]  # Linear trend coefficient

    # Forecast next 7 days
    last_val = arr[-1]
    forecast = []
    for i in range(7):
        predicted = last_val + trend * (i + 1) + random.uniform(-0.5, 0.5)
        forecast.append(max(0.1, round(predicted, 2)))

    now = datetime.now()
    labels = [(now + timedelta(days=i+1)).strftime("%a") for i in range(7)]

    return {
        "labels": labels,
        "forecast": forecast,
        "avg_current": round(float(np.mean(arr)), 2),
        "avg_forecast": round(float(np.mean(forecast)), 2),
        "trend": "improving" if trend < 0 else "worsening" if trend > 0.1 else "stable",
        "trend_pct": round(abs(trend) / (arr.mean() + 1e-9) * 100, 1),
    }
