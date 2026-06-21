"""Gamification service — XP, badges, streaks, levels, challenges."""
from typing import List, Dict, Optional

BADGES = [
    {"id": "first_step", "name": "First Step", "description": "Completed your first carbon calculation", "icon": "🌱", "xp_required": 0, "color": "#10b981"},
    {"id": "eco_week", "name": "Eco Week", "description": "Maintained a 7-day streak", "icon": "🔥", "xp_required": 100, "color": "#f59e0b"},
    {"id": "green_warrior", "name": "Green Warrior", "description": "Reached Green Warrior eco level", "icon": "⚔️", "xp_required": 500, "color": "#3b82f6"},
    {"id": "carbon_ninja", "name": "Carbon Ninja", "description": "Reduced emissions by 500 kg", "icon": "🥷", "xp_required": 1000, "color": "#8b5cf6"},
    {"id": "climate_champion", "name": "Climate Champion", "description": "Reached Climate Hero level", "icon": "🏆", "xp_required": 2000, "color": "#f97316"},
    {"id": "challenge_master", "name": "Challenge Master", "description": "Completed 10 challenges", "icon": "🎯", "xp_required": 750, "color": "#ec4899"},
    {"id": "streak_legend", "name": "Streak Legend", "description": "Maintained a 30-day streak", "icon": "⚡", "xp_required": 1500, "color": "#eab308"},
    {"id": "planet_protector", "name": "Planet Protector", "description": "Saved 1 tonne of CO₂", "icon": "🌍", "xp_required": 1200, "color": "#06b6d4"},
]

XP_REWARDS = {
    "daily_login": 10, "log_activity": 15,
    "complete_challenge_easy": 75, "complete_challenge_medium": 150, "complete_challenge_hard": 300,
    "carbon_calculation": 50, "streak_bonus_7day": 100, "streak_bonus_30day": 500,
    "reduce_emissions_100kg": 200, "share_achievement": 25,
}

ECO_LEVELS = [
    {"name": "Eco Beginner", "min_xp": 0, "color": "#6b7280", "icon": "🌱"},
    {"name": "Aware Citizen", "min_xp": 200, "color": "#10b981", "icon": "🌿"},
    {"name": "Green Warrior", "min_xp": 500, "color": "#3b82f6", "icon": "⚔️"},
    {"name": "Climate Hero", "min_xp": 1500, "color": "#f59e0b", "icon": "🦸"},
]

ALL_CHALLENGES = [
    {"id": "ch_001", "title": "Cloth Bag Champion", "description": "Say no to plastic covers at local markets & kirana stores for 7 days. Carry your own cloth/jute bag every time.", "category": "Shopping", "difficulty": "medium", "xp_reward": 150, "co2_savings_kg": 5.0, "duration_days": 7, "badge_reward": None, "icon": "🛍️"},
    {"id": "ch_002", "title": "Metro Yatri", "description": "Replace auto-rickshaw/cab with metro for all commutes for 7 days. Bonus points if you use a smart card!", "category": "Transport", "difficulty": "medium", "xp_reward": 200, "co2_savings_kg": 12.0, "duration_days": 7, "badge_reward": None, "icon": "🚇"},
    {"id": "ch_003", "title": "Millet Meal Week", "description": "Replace rice/roti with traditional millets (jowar/bajra/ragi) for all meals for 7 days. Good for you & the planet!", "category": "Food", "difficulty": "hard", "xp_reward": 300, "co2_savings_kg": 20.0, "duration_days": 7, "badge_reward": "carbon_ninja", "icon": "🌾"},
    {"id": "ch_004", "title": "AC at 24°C", "description": "Set your AC thermostat to 24°C (recommended by BEE India) for 14 days. Every degree higher saves 6% electricity!", "category": "Energy", "difficulty": "easy", "xp_reward": 100, "co2_savings_kg": 8.0, "duration_days": 14, "badge_reward": None, "icon": "❄️"},
    {"id": "ch_005", "title": "Wet-Dry Segregation", "description": "Segregate household waste into wet (kitchen) & dry (recyclable) every day for 14 days. Swachh Bharat starts at home!", "category": "Waste", "difficulty": "easy", "xp_reward": 120, "co2_savings_kg": 6.0, "duration_days": 14, "badge_reward": None, "icon": "🗑️"},
    {"id": "ch_006", "title": "Stairs Over Lift", "description": "Take the stairs instead of the lift for all trips up to 3 floors for 14 days. Great for health & the planet!", "category": "Lifestyle", "difficulty": "medium", "xp_reward": 180, "co2_savings_kg": 3.0, "duration_days": 14, "badge_reward": None, "icon": "🪜"},
    {"id": "ch_007", "title": "Plastic-Free Chai", "description": "Avoid single-use plastic cups at chai stalls & dhabas for 7 days. Carry your own steel kulhad/tiffin!", "category": "Shopping", "difficulty": "medium", "xp_reward": 140, "co2_savings_kg": 4.0, "duration_days": 7, "badge_reward": None, "icon": "☕"},
    {"id": "ch_008", "title": "Plant a Native Tree", "description": "Plant and adopt a native tree (neem/peepal/banyan) in your neighbourhood. Water & nurture it for 30 days.", "category": "Lifestyle", "difficulty": "hard", "xp_reward": 350, "co2_savings_kg": 30.0, "duration_days": 30, "badge_reward": "planet_protector", "icon": "🌳"},
    {"id": "ch_009", "title": "Carpool India", "description": "Carpool or share an auto for all commutes for 7 days. Use apps or coordinate with office colleagues!", "category": "Transport", "difficulty": "easy", "xp_reward": 75, "co2_savings_kg": 10.0, "duration_days": 7, "badge_reward": None, "icon": "🚗"},
    {"id": "ch_010", "title": "Rooftop Solar Month", "description": "Research & start the process of installing rooftop solar panels (or use solar water heater) within 30 days.", "category": "Energy", "difficulty": "hard", "xp_reward": 400, "co2_savings_kg": 50.0, "duration_days": 30, "badge_reward": "climate_champion", "icon": "☀️"},
]


def get_eco_level_from_xp(xp: int) -> str:
    level = "Eco Beginner"
    for lvl in ECO_LEVELS:
        if xp >= lvl["min_xp"]:
            level = lvl["name"]
    return level


def get_level_progress(xp: int) -> Dict:
    idx = 0
    for i, lvl in enumerate(ECO_LEVELS):
        if xp >= lvl["min_xp"]:
            idx = i
    cur = ECO_LEVELS[idx]
    nxt = ECO_LEVELS[idx + 1] if idx < len(ECO_LEVELS) - 1 else None
    if nxt:
        pct = min(100, int((xp - cur["min_xp"]) / (nxt["min_xp"] - cur["min_xp"]) * 100))
        to_next = nxt["min_xp"] - xp
    else:
        pct, to_next = 100, 0
    return {"current_level": cur["name"], "current_level_icon": cur["icon"],
            "next_level": nxt["name"] if nxt else "Max Level",
            "progress_pct": pct, "xp_to_next": to_next, "total_xp": xp}


def check_and_award_badges(user: dict) -> List[str]:
    earned = set(user.get("badges", []))
    xp = user.get("xp", 0)
    streak = user.get("streak", 0)
    saved = user.get("total_carbon_saved", 0)
    completed = user.get("challenges_completed", 0)
    level = user.get("eco_level", "Eco Beginner")
    new = []
    checks = {
        "first_step": True,
        "eco_week": streak >= 7,
        "green_warrior": level in ["Green Warrior", "Climate Hero"],
        "carbon_ninja": saved >= 500,
        "climate_champion": level == "Climate Hero",
        "challenge_master": completed >= 10,
        "streak_legend": streak >= 30,
        "planet_protector": saved >= 1000,
    }
    for bid, condition in checks.items():
        if bid not in earned and condition:
            new.append(bid)
    return new


def get_all_challenges() -> List[dict]:
    return ALL_CHALLENGES


def get_challenge_by_id(cid: str) -> Optional[dict]:
    return next((c for c in ALL_CHALLENGES if c["id"] == cid), None)


def get_all_badges() -> List[dict]:
    return BADGES
