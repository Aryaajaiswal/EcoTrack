"""AI Sustainability Coach — intelligent recommendations and predictions."""
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict
import random

GREETING_TEMPLATES = [
    "Hey {name}! Your eco-journey is inspiring 🌿 Here's what I noticed today.",
    "Great to see you, {name}! Let's continue building your sustainable future 🌍",
    "Hello {name}! I've analyzed your recent activity — here are your insights ✨",
    "Welcome back, {name}! You're making a real difference. Let's keep the momentum! 🚀",
]

DAILY_TIPS = [
    {"tip": "Unplug chargers when not in use — vampire power adds up to 10% of your electricity bill.", "category": "Energy", "impact": "saves ~50 kg CO₂/year", "icon": "⚡"},
    {"tip": "Try a 'Meatless Monday' — one plant-based day per week reduces food emissions by 14%.", "category": "Food", "impact": "saves ~350 kg CO₂/year", "icon": "🥦"},
    {"tip": "Cold water washing saves up to 90% of laundry energy.", "category": "Home", "impact": "saves ~30 kg CO₂/year", "icon": "🧺"},
    {"tip": "Walk or cycle for trips under 3km — zero emissions and great for health.", "category": "Transport", "impact": "saves ~100 kg CO₂/year", "icon": "🚴"},
    {"tip": "Bring your own reusable cup — most coffee shops offer discounts!", "category": "Shopping", "impact": "saves ~15 kg CO₂/year", "icon": "☕"},
    {"tip": "Plant a tree! A single tree absorbs ~21 kg of CO₂ per year.", "category": "Lifestyle", "impact": "absorbs ~21 kg CO₂/year", "icon": "🌳"},
    {"tip": "Use a smart power strip to eliminate standby power waste.", "category": "Energy", "impact": "saves ~40 kg CO₂/year", "icon": "🔌"},
    {"tip": "Buy local and seasonal produce — it uses far less transport and storage energy.", "category": "Food", "impact": "saves ~200 kg CO₂/year", "icon": "🥕"},
    {"tip": "Fix leaky faucets! A dripping tap wastes 15 liters/day.", "category": "Water", "impact": "saves ~5 kg CO₂/year", "icon": "💧"},
    {"tip": "Opt for digital receipts and statements to reduce paper production.", "category": "Lifestyle", "impact": "saves ~10 kg CO₂/year", "icon": "📱"},
]


def get_greeting(user_name: str) -> str:
    return random.choice(GREETING_TEMPLATES).format(name=user_name.split()[0] if user_name else "there")


def get_daily_tip() -> dict:
    return random.choice(DAILY_TIPS)


def get_daily_tips(count: int = 3) -> List[dict]:
    return random.sample(DAILY_TIPS, min(count, len(DAILY_TIPS)))


def get_ai_insight(carbon_score: float, eco_level: str, streak: int, xp: int) -> str:
    parts = []
    if streak >= 7:
        parts.append(f"🔥 Amazing! Your {streak}-day streak is reducing emissions by ~{streak * 0.8:.1f} kg CO₂!")
    elif streak >= 3:
        parts.append(f"📈 You're on a {streak}-day streak! 7 days unlocks the Eco Week badge.")
    else:
        parts.append("💪 Start a daily streak by logging your activities — every action counts!")
    if carbon_score < 2000:
        parts.append(f"🌟 At {carbon_score:.0f} kg/year, you're well below the global average of 4,700 kg!")
    elif carbon_score < 4700:
        parts.append(f"✅ You're {4700 - carbon_score:.0f} kg below the global average! Keep it up.")
    else:
        parts.append(f"🎯 Focus on transport and food first — they have the biggest impact.")
    return " ".join(parts[:2])


def generate_chat_response(message: str, user_context: dict) -> str:
    msg = message.lower()
    name = (user_context.get("name") or "there").split()[0]
    if any(w in msg for w in ["car", "drive", "transport", "flight", "travel", "commute"]):
        return (f"Great question, {name}! Transport is typically 30–40% of personal footprints. "
                "Switching to public transit or an EV cuts transport emissions by 60–80%. "
                "Each long-haul flight adds ~990 kg CO₂ — consider train or video calls instead. 🚗")
    if any(w in msg for w in ["food", "eat", "diet", "meat", "vegan", "vegetarian"]):
        return (f"Food choices are powerful, {name}! A plant-based diet produces 50% fewer emissions than heavy meat. "
                "Try Meatless Mondays — one day/week saves ~350 kg CO₂/year. Local and seasonal produce helps too. 🥦")
    if any(w in msg for w in ["energy", "electricity", "solar", "power", "ac", "heating"]):
        return (f"Home energy is a big opportunity, {name}! Switching to renewables can eliminate 1–3 tonnes CO₂/year. "
                "LED lighting, smart thermostats, and unplugging devices cut usage by 25%. ⚡☀️")
    if any(w in msg for w in ["score", "level", "xp", "badge", "improve", "progress"]):
        level = user_context.get("eco_level", "Eco Beginner")
        xp = user_context.get("xp", 0)
        return (f"You're doing great, {name}! As a {level} with {xp} XP, you're already making a difference. "
                "Complete daily challenges (+75–300 XP each) and maintain your streak to level up faster! 🏆")
    if any(w in msg for w in ["challenge", "mission", "task", "goal"]):
        return (f"Challenges are the fastest way to earn XP, {name}! "
                "Start with 'Energy Saver' (easy, +100 XP) or 'Zero Plastic Week' (+150 XP). "
                "Each challenge logs real CO₂ savings to your profile. 🌿")
    if any(w in msg for w in ["hello", "hi", "hey", "good morning", "good evening"]):
        return get_greeting(user_context.get("name", "eco friend"))
    tip = random.choice(DAILY_TIPS)
    return (f"Here's a tip for you, {name}: {tip['tip']} "
            f"This {tip['impact']}. Ask me about transport, food, energy, or challenges for more! 🌍")


def predict_future_emissions(current_annual_co2: float, sustainability_score: int, streak: int, months: int = 12) -> Dict:
    base_monthly = current_annual_co2 / 12
    rate = 0.005 + min(streak * 0.001, 0.02) + (sustainability_score / 100) * 0.01
    now = datetime.now()
    labels, current, optimistic, pessimistic = [], [], [], []
    m, o, p = base_monthly, base_monthly, base_monthly
    for i in range(months):
        labels.append((now + timedelta(days=30 * i)).strftime("%b %Y"))
        v = 1 + random.uniform(-0.05, 0.05)
        current.append(round(m * v, 1))
        optimistic.append(round(o * (1 - rate * 1.5) * v, 1))
        pessimistic.append(round(p * (1 + rate * 0.3) * v, 1))
        m *= (1 - rate); o *= (1 - rate * 1.5); p *= (1 + rate * 0.3)
    cur_annual = sum(current)
    opt_annual = sum(optimistic)
    return {
        "labels": labels, "current_trajectory": current,
        "optimistic_trajectory": optimistic, "pessimistic_trajectory": pessimistic,
        "current_annual_predicted": round(cur_annual, 1),
        "optimistic_annual": round(opt_annual, 1),
        "potential_annual_savings": round(cur_annual - opt_annual, 1),
        "improvement_rate_monthly_pct": round(rate * 100, 2),
        "forecast_confidence": min(95, 60 + sustainability_score * 0.35),
    }


def generate_weekly_forecast(daily_emissions: List[float]) -> Dict:
    if not daily_emissions or len(daily_emissions) < 3:
        daily_emissions = [random.uniform(8, 18) for _ in range(14)]
    arr = np.array(daily_emissions[-14:])
    trend = np.polyfit(range(len(arr)), arr, 1)[0]
    last = float(arr[-1])
    now = datetime.now()
    forecast = [max(0.1, round(last + trend * (i + 1) + random.uniform(-0.5, 0.5), 2)) for i in range(7)]
    return {
        "labels": [(now + timedelta(days=i + 1)).strftime("%a") for i in range(7)],
        "forecast": forecast,
        "avg_current": round(float(np.mean(arr)), 2),
        "avg_forecast": round(float(np.mean(forecast)), 2),
        "trend": "improving" if trend < 0 else "worsening" if trend > 0.1 else "stable",
        "trend_pct": round(abs(trend) / (arr.mean() + 1e-9) * 100, 1),
    }
