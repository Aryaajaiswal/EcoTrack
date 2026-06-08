"""
Gamification service — XP, badges, streaks, levels, challenges.
"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# --- Badge Definitions ---
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

# --- XP Rewards ---
XP_REWARDS = {
    "daily_login": 10,
    "log_activity": 15,
    "complete_challenge_easy": 75,
    "complete_challenge_medium": 150,
    "complete_challenge_hard": 300,
    "carbon_calculation": 50,
    "streak_bonus_7day": 100,
    "streak_bonus_30day": 500,
    "reduce_emissions_100kg": 200,
    "share_achievement": 25,
}

# --- Eco Level Thresholds ---
ECO_LEVELS = [
    {"name": "Eco Beginner", "min_xp": 0, "color": "#6b7280", "icon": "🌱"},
    {"name": "Aware Citizen", "min_xp": 200, "color": "#10b981", "icon": "🌿"},
    {"name": "Green Warrior", "min_xp": 500, "color": "#3b82f6", "icon": "⚔️"},
    {"name": "Climate Hero", "min_xp": 1500, "color": "#f59e0b", "icon": "🦸"},
]

# --- Pre-defined Challenges ---
ALL_CHALLENGES = [
    {
        "id": "ch_001",
        "title": "Zero Plastic Week",
        "description": "Avoid all single-use plastic for 7 days straight. Bring your own bags, bottle, and containers.",
        "category": "Shopping",
        "difficulty": "medium",
        "xp_reward": 150,
        "co2_savings_kg": 5.0,
        "duration_days": 7,
        "badge_reward": None,
        "icon": "🚫🧴"
    },
    {
        "id": "ch_002",
        "title": "Cycle Commuter",
        "description": "Replace car or transit commutes with cycling or walking for 5 consecutive days.",
        "category": "Transport",
        "difficulty": "medium",
        "xp_reward": 200,
        "co2_savings_kg": 12.0,
        "duration_days": 5,
        "badge_reward": None,
        "icon": "🚲"
    },
    {
        "id": "ch_003",
        "title": "Plant-Based Week",
        "description": "Eat a fully plant-based diet for 7 days — no meat, dairy, or eggs.",
        "category": "Food",
        "difficulty": "hard",
        "xp_reward": 300,
        "co2_savings_kg": 20.0,
        "duration_days": 7,
        "badge_reward": "carbon_ninja",
        "icon": "🥗"
    },
    {
        "id": "ch_004",
        "title": "Energy Saver",
        "description": "Reduce your home electricity usage by 20% this week by turning off lights and unplugging devices.",
        "category": "Energy",
        "difficulty": "easy",
        "xp_reward": 100,
        "co2_savings_kg": 8.0,
        "duration_days": 7,
        "badge_reward": None,
        "icon": "💡"
    },
    {
        "id": "ch_005",
        "title": "Composting Starter",
        "description": "Start composting your food scraps every day for 14 days.",
        "category": "Waste",
        "difficulty": "easy",
        "xp_reward": 120,
        "co2_savings_kg": 6.0,
        "duration_days": 14,
        "badge_reward": None,
        "icon": "🌱"
    },
    {
        "id": "ch_006",
        "title": "Local Shopper",
        "description": "Buy only locally produced food and products for 14 days.",
        "category": "Food",
        "difficulty": "medium",
        "xp_reward": 180,
        "co2_savings_kg": 15.0,
        "duration_days": 14,
        "badge_reward": None,
        "icon": "🏪"
    },
    {
        "id": "ch_007",
        "title": "Water Warrior",
        "description": "Reduce your daily water usage by 30% for 7 days — shorter showers, fix leaks.",
        "category": "Water",
        "difficulty": "medium",
        "xp_reward": 140,
        "co2_savings_kg": 4.0,
        "duration_days": 7,
        "badge_reward": None,
        "icon": "💧"
    },
    {
        "id": "ch_008",
        "title": "Secondhand Only",
        "description": "For 30 days, only buy secondhand or recycled products when you need something.",
        "category": "Shopping",
        "difficulty": "hard",
        "xp_reward": 350,
        "co2_savings_kg": 30.0,
        "duration_days": 30,
        "badge_reward": "planet_protector",
        "icon": "♻️"
    },
    {
        "id": "ch_009",
        "title": "Digital Detox Day",
        "description": "Reduce screen time by 50% for 1 day — less streaming means less data center energy.",
        "category": "Lifestyle",
        "difficulty": "easy",
        "xp_reward": 75,
        "co2_savings_kg": 2.0,
        "duration_days": 1,
        "badge_reward": None,
        "icon": "📵"
    },
    {
        "id": "ch_010",
        "title": "Public Transit Month",
        "description": "Use only public transit, cycling, or walking for all commutes for 30 days.",
        "category": "Transport",
        "difficulty": "hard",
        "xp_reward": 400,
        "co2_savings_kg": 50.0,
        "duration_days": 30,
        "badge_reward": "climate_champion",
        "icon": "🚌"
    },
]


def get_eco_level_from_xp(xp: int) -> str:
    """Determine eco level from XP."""
    level = "Eco Beginner"
    for lvl in ECO_LEVELS:
        if xp >= lvl["min_xp"]:
            level = lvl["name"]
    return level


def get_level_progress(xp: int) -> Dict:
    """Get level progress information."""
    current_level_idx = 0
    for i, lvl in enumerate(ECO_LEVELS):
        if xp >= lvl["min_xp"]:
            current_level_idx = i

    current_level = ECO_LEVELS[current_level_idx]
    next_level = ECO_LEVELS[current_level_idx + 1] if current_level_idx < len(ECO_LEVELS) - 1 else None

    if next_level:
        xp_in_level = xp - current_level["min_xp"]
        xp_needed = next_level["min_xp"] - current_level["min_xp"]
        progress_pct = min(100, int((xp_in_level / xp_needed) * 100))
        xp_to_next = next_level["min_xp"] - xp
    else:
        progress_pct = 100
        xp_to_next = 0

    return {
        "current_level": current_level["name"],
        "current_level_icon": current_level["icon"],
        "next_level": next_level["name"] if next_level else "Max Level",
        "progress_pct": progress_pct,
        "xp_to_next": xp_to_next,
        "total_xp": xp,
    }


def check_and_award_badges(user: dict) -> List[str]:
    """Check if user qualifies for any new badges and return newly earned badge IDs."""
    user_badges = set(user.get("badges", []))
    xp = user.get("xp", 0)
    streak = user.get("streak", 0)
    total_carbon_saved = user.get("total_carbon_saved", 0)
    challenges_completed = user.get("challenges_completed", 0)
    eco_level = user.get("eco_level", "Eco Beginner")

    new_badges = []

    for badge in BADGES:
        if badge["id"] in user_badges:
            continue  # Already earned

        # Check badge conditions
        earned = False
        if badge["id"] == "first_step" and xp >= 0:
            earned = True
        elif badge["id"] == "eco_week" and streak >= 7:
            earned = True
        elif badge["id"] == "green_warrior" and eco_level in ["Green Warrior", "Climate Hero"]:
            earned = True
        elif badge["id"] == "carbon_ninja" and total_carbon_saved >= 500:
            earned = True
        elif badge["id"] == "climate_champion" and eco_level == "Climate Hero":
            earned = True
        elif badge["id"] == "challenge_master" and challenges_completed >= 10:
            earned = True
        elif badge["id"] == "streak_legend" and streak >= 30:
            earned = True
        elif badge["id"] == "planet_protector" and total_carbon_saved >= 1000:
            earned = True

        if earned:
            new_badges.append(badge["id"])

    return new_badges


def get_all_challenges() -> List[dict]:
    """Return all available challenges."""
    return ALL_CHALLENGES


def get_challenge_by_id(challenge_id: str) -> Optional[dict]:
    """Get a specific challenge by ID."""
    for ch in ALL_CHALLENGES:
        if ch["id"] == challenge_id:
            return ch
    return None


def get_all_badges() -> List[dict]:
    """Return all badge definitions."""
    return BADGES
