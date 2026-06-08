"""
Carbon footprint calculation service.
Implements detailed CO2 emission calculations based on IPCC and EPA emission factors.
"""
from app.models.carbon import (
    CarbonCalculationInput, CarbonCalculationResult,
    CategoryBreakdown
)
from typing import List
import logging

logger = logging.getLogger(__name__)

# --- Emission Factors (kg CO2 per unit) ---
# Sources: IPCC, EPA, Our World in Data

TRANSPORT_FACTORS = {
    "petrol": 0.21,       # kg CO2 per km
    "diesel": 0.17,       # kg CO2 per km
    "electric": 0.05,     # kg CO2 per km (depends on grid)
    "hybrid": 0.10,       # kg CO2 per km
}

FLIGHT_FACTORS = {
    "domestic": 255,      # kg CO2 per flight (avg ~1000km)
    "international": 990, # kg CO2 per flight (avg ~7000km)
}

FOOD_FACTORS = {
    "vegan": 1500,        # kg CO2 per year
    "vegetarian": 1700,   # kg CO2 per year
    "omnivore": 2500,     # kg CO2 per year
    "heavy_meat": 3300,   # kg CO2 per year
}

PLASTIC_FACTORS = {
    "low": 30,            # kg CO2 per year
    "medium": 80,
    "high": 160,
}

RECYCLING_FACTORS = {
    "always": 0.5,        # multiplier (saves 50%)
    "sometimes": 0.8,
    "never": 1.0,
}

# Average global CO2 per year for comparison
GLOBAL_AVERAGE_KG = 4_700  # kg per year (global average per person)
US_AVERAGE_KG = 15_000     # kg per year (US average)


def calculate_transportation_emissions(data) -> float:
    """Calculate annual transportation CO2 in kg."""
    # Car emissions
    car_factor = TRANSPORT_FACTORS.get(data.car_type, 0.21)
    car_annual = data.car_km_per_week * 52 * car_factor

    # Bike = 0 emissions
    bike_annual = 0.0

    # Public transport (average bus/train = 0.089 kg/km)
    public_annual = data.public_transport_km_per_week * 52 * 0.089

    # Flights
    flight_factor = FLIGHT_FACTORS.get(data.flight_type, 255)
    flight_annual = data.flights_per_year * flight_factor

    return car_annual + bike_annual + public_annual + flight_annual


def calculate_home_energy_emissions(data) -> float:
    """Calculate annual home energy CO2 in kg."""
    # Electricity (global avg grid = 0.475 kg CO2/kWh)
    renewable_factor = 1 - (data.renewable_energy_percent / 100) * 0.85
    electricity_annual = data.electricity_kwh_per_month * 12 * 0.475 * renewable_factor

    # AC additional (avg 1.5 kW AC, 0.475 kg/kWh)
    ac_annual = data.ac_hours_per_day * 365 * 1.5 * 0.475

    # Divide by household size
    per_person = (electricity_annual + ac_annual) / max(data.num_people_in_home, 1)
    return per_person


def calculate_food_emissions(data) -> float:
    """Calculate annual food CO2 in kg."""
    base = FOOD_FACTORS.get(data.diet_type, 2500)

    # Dairy adjustment (avg 3.2 kg CO2 per serving)
    dairy_annual = data.dairy_servings_per_week * 52 * 3.2

    # Food waste multiplier
    waste_multipliers = {"low": 1.0, "medium": 1.15, "high": 1.3}
    waste_mult = waste_multipliers.get(data.food_waste_level, 1.15)

    return (base + dairy_annual) * waste_mult


def calculate_shopping_emissions(data) -> float:
    """Calculate annual shopping CO2 in kg."""
    # Clothing (avg 10 kg CO2 per new item)
    secondhand_factor = 0.4 if data.buys_secondhand else 1.0
    clothing_annual = data.clothing_items_per_month * 12 * 10 * secondhand_factor

    # Online orders (avg 0.5 kg CO2 per delivery)
    online_annual = data.online_orders_per_month * 12 * 0.5

    # Plastic usage
    plastic_annual = PLASTIC_FACTORS.get(data.plastic_usage, 80)

    return clothing_annual + online_annual + plastic_annual


def calculate_lifestyle_emissions(data) -> float:
    """Calculate annual lifestyle CO2 in kg."""
    # Water usage (avg 0.0003 kg CO2 per liter)
    water_annual = data.water_liters_per_day * 365 * 0.0003

    # Waste
    recycling_mult = RECYCLING_FACTORS.get(data.recycling_habit, 0.8)
    waste_annual = data.waste_kg_per_week * 52 * 0.5 * recycling_mult  # 0.5 kg CO2 per kg waste

    return water_annual + waste_annual


def calculate_sustainability_score(total_co2_kg: float) -> int:
    """
    Calculate sustainability score 0-100.
    Lower emissions = higher score.
    Based on comparison to global average.
    """
    # Score based on how much below global average
    ratio = total_co2_kg / GLOBAL_AVERAGE_KG

    if ratio <= 0.3:
        return 98
    elif ratio <= 0.5:
        return 90
    elif ratio <= 0.7:
        return 80
    elif ratio <= 0.9:
        return 70
    elif ratio <= 1.0:
        return 62
    elif ratio <= 1.2:
        return 52
    elif ratio <= 1.5:
        return 42
    elif ratio <= 2.0:
        return 30
    elif ratio <= 3.0:
        return 18
    else:
        return 8


def get_eco_level(score: int) -> str:
    """Determine eco level from sustainability score."""
    if score >= 80:
        return "Climate Hero"
    elif score >= 60:
        return "Green Warrior"
    elif score >= 40:
        return "Aware Citizen"
    else:
        return "Eco Beginner"


def get_percentile(total_co2_kg: float) -> float:
    """Estimate what % of the global population this user emits less than."""
    if total_co2_kg < 1000:
        return 95.0
    elif total_co2_kg < 2000:
        return 85.0
    elif total_co2_kg < 3000:
        return 75.0
    elif total_co2_kg < 5000:
        return 55.0
    elif total_co2_kg < 8000:
        return 35.0
    elif total_co2_kg < 12000:
        return 20.0
    else:
        return 8.0


def generate_recommendations(data: CarbonCalculationInput, breakdown: CategoryBreakdown) -> List[str]:
    """Generate personalized sustainability recommendations."""
    recs = []

    # Transportation recommendations
    if breakdown.transportation > 2000:
        if data.transportation.car_km_per_week > 100:
            recs.append("🚗 Consider carpooling or switching to an electric vehicle — could reduce transport emissions by 40–60%.")
        if data.transportation.flights_per_year > 2:
            recs.append("✈️ Each long-haul flight adds ~990 kg CO₂. Consider train travel or video calls for business trips.")
        if data.transportation.public_transport_km_per_week < 20:
            recs.append("🚌 Using public transport twice a week could reduce your transport footprint by up to 18%.")

    # Home energy recommendations
    if data.home_energy.electricity_kwh_per_month > 300:
        recs.append("💡 Switching to LED lighting and energy-efficient appliances can cut home energy use by 25%.")
    if data.home_energy.renewable_energy_percent < 30:
        recs.append("☀️ Installing solar panels or choosing a green energy tariff could save 1–2 tonnes of CO₂ annually.")
    if data.home_energy.ac_hours_per_day > 6:
        recs.append("❄️ Reducing AC use by 2 hours/day and using fans can save ~150 kg CO₂ per year.")

    # Food recommendations
    if data.food.diet_type in ["omnivore", "heavy_meat"]:
        recs.append("🥦 Adopting a plant-based diet 3 days/week could reduce food emissions by up to 30%.")
    if data.food.food_waste_level == "high":
        recs.append("🍽️ Reducing food waste by meal planning could save ~0.5 tonnes CO₂/year.")
    if data.food.dairy_servings_per_week > 14:
        recs.append("🥛 Swapping 50% of dairy for plant-based alternatives saves ~200 kg CO₂ per year.")

    # Shopping recommendations
    if data.shopping.plastic_usage in ["medium", "high"]:
        recs.append("♻️ Carrying a reusable bag and bottle eliminates ~80 kg of plastic-related CO₂ annually.")
    if data.shopping.clothing_items_per_month > 3 and not data.shopping.buys_secondhand:
        recs.append("👕 Buying secondhand clothing cuts fashion emissions by up to 70% per item.")

    # Lifestyle recommendations
    if data.lifestyle.recycling_habit != "always":
        recs.append("♻️ Recycling consistently can reduce your waste-related emissions by 50%.")
    if data.lifestyle.water_liters_per_day > 200:
        recs.append("💧 Shorter showers (5 min) and fixing leaks can save up to 30,000 liters of water per year.")

    # Add general tip if few specific ones
    if len(recs) < 3:
        recs.append("🌳 Planting trees and supporting reforestation projects is a powerful way to offset remaining emissions.")
        recs.append("📱 Track your daily habits in EcoTrack AI to spot patterns and unlock streak bonuses!")

    return recs[:6]  # Return top 6 recommendations


def calculate_potential_savings(breakdown: CategoryBreakdown) -> float:
    """Calculate achievable CO2 savings with moderate lifestyle changes."""
    transport_saving = breakdown.transportation * 0.30
    energy_saving = breakdown.home_energy * 0.25
    food_saving = breakdown.food * 0.20
    shopping_saving = breakdown.shopping * 0.35
    lifestyle_saving = breakdown.lifestyle * 0.20
    return round(transport_saving + energy_saving + food_saving + shopping_saving + lifestyle_saving, 1)


def perform_carbon_calculation(data: CarbonCalculationInput) -> CarbonCalculationResult:
    """
    Main calculation function. Takes input data and returns full result.
    """
    # Calculate each category
    transport_co2 = round(calculate_transportation_emissions(data.transportation), 1)
    energy_co2 = round(calculate_home_energy_emissions(data.home_energy), 1)
    food_co2 = round(calculate_food_emissions(data.food), 1)
    shopping_co2 = round(calculate_shopping_emissions(data.shopping), 1)
    lifestyle_co2 = round(calculate_lifestyle_emissions(data.lifestyle), 1)

    total_co2 = transport_co2 + energy_co2 + food_co2 + shopping_co2 + lifestyle_co2

    breakdown = CategoryBreakdown(
        transportation=transport_co2,
        home_energy=energy_co2,
        food=food_co2,
        shopping=shopping_co2,
        lifestyle=lifestyle_co2,
    )

    score = calculate_sustainability_score(total_co2)
    eco_level = get_eco_level(score)
    percentile = get_percentile(total_co2)
    recommendations = generate_recommendations(data, breakdown)
    potential_savings = calculate_potential_savings(breakdown)

    return CarbonCalculationResult(
        total_co2_kg_per_year=round(total_co2, 1),
        monthly_co2_kg=round(total_co2 / 12, 1),
        daily_co2_kg=round(total_co2 / 365, 2),
        category_breakdown=breakdown,
        sustainability_score=score,
        eco_level=eco_level,
        percentile_better_than=percentile,
        recommendations=recommendations,
        potential_savings_kg=potential_savings,
    )
