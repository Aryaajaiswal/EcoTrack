"""Carbon footprint calculation service using IPCC/EPA emission factors."""
from app.models.carbon import CarbonCalculationInput, CarbonCalculationResult, CategoryBreakdown
from typing import List

TRANSPORT_FACTORS = {"petrol": 0.21, "diesel": 0.17, "electric": 0.05, "hybrid": 0.10}
FLIGHT_FACTORS = {"domestic": 255, "international": 990}
FOOD_FACTORS = {"vegan": 1500, "vegetarian": 1700, "omnivore": 2500, "heavy_meat": 3300}
PLASTIC_FACTORS = {"low": 30, "medium": 80, "high": 160}
RECYCLING_FACTORS = {"always": 0.5, "sometimes": 0.8, "never": 1.0}
GLOBAL_AVERAGE_KG = 4700


def calculate_transportation_emissions(d) -> float:
    car = d.car_km_per_week * 52 * TRANSPORT_FACTORS.get(d.car_type, 0.21)
    public = d.public_transport_km_per_week * 52 * 0.089
    flights = d.flights_per_year * FLIGHT_FACTORS.get(d.flight_type, 255)
    return car + public + flights


def calculate_home_energy_emissions(d) -> float:
    renewable_factor = 1 - (d.renewable_energy_percent / 100) * 0.85
    electricity = d.electricity_kwh_per_month * 12 * 0.475 * renewable_factor
    ac = d.ac_hours_per_day * 365 * 1.5 * 0.475
    return (electricity + ac) / max(d.num_people_in_home, 1)


def calculate_food_emissions(d) -> float:
    base = FOOD_FACTORS.get(d.diet_type, 2500)
    dairy = d.dairy_servings_per_week * 52 * 3.2
    waste_mult = {"low": 1.0, "medium": 1.15, "high": 1.3}.get(d.food_waste_level, 1.15)
    return (base + dairy) * waste_mult


def calculate_shopping_emissions(d) -> float:
    clothing = d.clothing_items_per_month * 12 * 10 * (0.4 if d.buys_secondhand else 1.0)
    online = d.online_orders_per_month * 12 * 0.5
    plastic = PLASTIC_FACTORS.get(d.plastic_usage, 80)
    return clothing + online + plastic


def calculate_lifestyle_emissions(d) -> float:
    water = d.water_liters_per_day * 365 * 0.0003
    waste = d.waste_kg_per_week * 52 * 0.5 * RECYCLING_FACTORS.get(d.recycling_habit, 0.8)
    return water + waste


def calculate_sustainability_score(total: float) -> int:
    ratio = total / GLOBAL_AVERAGE_KG
    if ratio <= 0.3: return 98
    if ratio <= 0.5: return 90
    if ratio <= 0.7: return 80
    if ratio <= 0.9: return 70
    if ratio <= 1.0: return 62
    if ratio <= 1.2: return 52
    if ratio <= 1.5: return 42
    if ratio <= 2.0: return 30
    if ratio <= 3.0: return 18
    return 8


def get_eco_level(score: int) -> str:
    if score >= 80: return "Climate Hero"
    if score >= 60: return "Green Warrior"
    if score >= 40: return "Aware Citizen"
    return "Eco Beginner"


def get_percentile(total: float) -> float:
    if total < 1000: return 95.0
    if total < 2000: return 85.0
    if total < 3000: return 75.0
    if total < 5000: return 55.0
    if total < 8000: return 35.0
    if total < 12000: return 20.0
    return 8.0


def generate_recommendations(data: CarbonCalculationInput, bd: CategoryBreakdown) -> List[str]:
    recs = []
    if bd.transportation > 2000:
        if data.transportation.car_km_per_week > 100:
            recs.append("🚗 Consider carpooling or switching to an EV — could reduce transport emissions by 40–60%.")
        if data.transportation.flights_per_year > 2:
            recs.append("✈️ Each long-haul flight adds ~990 kg CO₂. Consider train travel or video calls.")
        if data.transportation.public_transport_km_per_week < 20:
            recs.append("🚌 Using public transport twice a week could reduce your transport footprint by 18%.")
    if data.home_energy.electricity_kwh_per_month > 300:
        recs.append("💡 LED lighting and efficient appliances can cut home energy use by 25%.")
    if data.home_energy.renewable_energy_percent < 30:
        recs.append("☀️ Switching to a green energy tariff could save 1–2 tonnes of CO₂ annually.")
    if data.food.diet_type in ["omnivore", "heavy_meat"]:
        recs.append("🥦 Going plant-based 3 days/week could reduce food emissions by 30%.")
    if data.food.food_waste_level == "high":
        recs.append("🍽️ Reducing food waste by meal planning could save ~0.5 tonnes CO₂/year.")
    if data.shopping.plastic_usage in ["medium", "high"]:
        recs.append("♻️ Reusable bags and bottles eliminate ~80 kg of plastic-related CO₂ annually.")
    if not data.shopping.buys_secondhand and data.shopping.clothing_items_per_month > 3:
        recs.append("👕 Buying secondhand clothing cuts fashion emissions by up to 70% per item.")
    if data.lifestyle.recycling_habit != "always":
        recs.append("♻️ Consistent recycling can reduce your waste emissions by 50%.")
    if len(recs) < 3:
        recs.append("🌳 Planting trees and supporting reforestation offsets remaining emissions.")
        recs.append("📱 Log daily habits in EcoTrack AI to unlock streak bonuses!")
    return recs[:6]


def perform_carbon_calculation(data: CarbonCalculationInput) -> CarbonCalculationResult:
    t = round(calculate_transportation_emissions(data.transportation), 1)
    e = round(calculate_home_energy_emissions(data.home_energy), 1)
    f = round(calculate_food_emissions(data.food), 1)
    s = round(calculate_shopping_emissions(data.shopping), 1)
    l = round(calculate_lifestyle_emissions(data.lifestyle), 1)
    total = t + e + f + s + l
    bd = CategoryBreakdown(transportation=t, home_energy=e, food=f, shopping=s, lifestyle=l)
    score = calculate_sustainability_score(total)
    savings = round(t * 0.3 + e * 0.25 + f * 0.2 + s * 0.35 + l * 0.2, 1)
    return CarbonCalculationResult(
        total_co2_kg_per_year=round(total, 1),
        monthly_co2_kg=round(total / 12, 1),
        daily_co2_kg=round(total / 365, 2),
        category_breakdown=bd,
        sustainability_score=score,
        eco_level=get_eco_level(score),
        percentile_better_than=get_percentile(total),
        recommendations=generate_recommendations(data, bd),
        potential_savings_kg=savings,
    )
