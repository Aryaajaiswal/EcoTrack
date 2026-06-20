"""Carbon footprint calculation service — India-specific emission factors & measures."""
from app.models.carbon import CarbonCalculationInput, CarbonCalculationResult, CategoryBreakdown
from typing import List

# India-specific emission factors
TRANSPORT_FACTORS = {"petrol": 0.19, "diesel": 0.15, "electric": 0.04, "hybrid": 0.09, "cng": 0.12}
MOTORCYCLE_FACTOR = 0.035
AUTO_FACTOR = 0.055
METRO_FACTOR = 0.015
BUS_FACTOR = 0.075
FLIGHT_FACTORS = {"domestic": 180, "international": 720}
FOOD_FACTORS = {"vegan": 1200, "vegetarian": 1400, "eggetarian": 1550, "omnivore": 2100, "heavy_meat": 2800}
PLASTIC_FACTORS = {"low": 30, "medium": 80, "high": 160}
RECYCLING_FACTORS = {"always": 0.5, "sometimes": 0.8, "never": 1.0}
INDIAN_GRID_FACTOR = 0.82  # kg CO2/kWh (vs 0.475 global average)
LPG_FACTOR = 1.5  # kg CO2 per LPG cylinder usage per month
INDIAN_AVERAGE_KG = 1400  # India per capita annual CO2 (~1.4 tonnes)
GLOBAL_AVERAGE_KG = 4700


def calculate_transportation_emissions(d) -> float:
    car = d.car_km_per_week * 52 * TRANSPORT_FACTORS.get(d.car_type, 0.19)
    motorcycle = d.motorcycle_km_per_week * 52 * MOTORCYCLE_FACTOR
    auto = d.auto_km_per_week * 52 * AUTO_FACTOR
    metro = d.metro_km_per_week * 52 * METRO_FACTOR
    bus = d.bus_km_per_week * 52 * BUS_FACTOR
    public = d.public_transport_km_per_week * 52 * 0.089
    flights = d.flights_per_year * FLIGHT_FACTORS.get(d.flight_type, 180)
    return car + motorcycle + auto + metro + bus + public + flights


def calculate_home_energy_emissions(d) -> float:
    renewable_factor = 1 - (d.renewable_energy_percent / 100) * 0.85
    electricity = d.electricity_kwh_per_month * 12 * INDIAN_GRID_FACTOR * renewable_factor
    ac = d.ac_hours_per_day * 365 * 1.5 * INDIAN_GRID_FACTOR
    lpg = d.lpg_cylinders_per_month * 12 * LPG_FACTOR
    return (electricity + ac + lpg) / max(d.num_people_in_home, 1)


def calculate_food_emissions(d) -> float:
    base = FOOD_FACTORS.get(d.diet_type, 1400)
    dairy = d.dairy_servings_per_week * 52 * 3.2
    rice_mult = 1 + (d.rice_meals_per_week / 14) * 0.15  # rice has higher methane impact
    waste_mult = {"low": 1.0, "medium": 1.15, "high": 1.3}.get(d.food_waste_level, 1.15)
    return (base + dairy) * waste_mult * rice_mult


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
    ratio = total / INDIAN_AVERAGE_KG
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
    if total < 500: return 95.0
    if total < 800: return 85.0
    if total < 1100: return 70.0
    if total < 1400: return 50.0
    if total < 2000: return 30.0
    if total < 3000: return 15.0
    return 5.0


def generate_recommendations(data: CarbonCalculationInput, bd: CategoryBreakdown) -> List[str]:
    recs = []
    if bd.transportation > 1000:
        if data.transportation.car_km_per_week > 80:
            recs.append("🚗 Consider switching to CNG or electric — saves 30-50% on fuel emissions in Indian cities.")
        if data.transportation.motorcycle_km_per_week > 50:
            recs.append("🏍️ Try using metro or auto for shorter trips — motorcycles emit 3x more than metro per km.")
        if data.transportation.auto_km_per_week > 30:
            recs.append("🛺 Share autos via apps like Uber/Ola Auto to split emissions per passenger.")
        if data.transportation.flights_per_year > 2:
            recs.append("✈️ Consider Shatabdi/Vande Bharat trains for inter-city travel — much lower emissions than flights.")
        if data.transportation.metro_km_per_week < 20 and any([data.transportation.car_km_per_week > 30, data.transportation.motorcycle_km_per_week > 20]):
            recs.append("🚇 India's metro network is expanding — using metro 3x a week can cut commute emissions by 60%.")
    if data.home_energy.electricity_kwh_per_month > 250:
        recs.append("💡 Switch to 5-star BEE rated appliances and LED lights — can cut 30% of home electricity use.")
    if data.home_energy.ac_hours_per_day > 6:
        recs.append("❄️ Set AC to 24°C instead of 18°C — saves ~20% electricity per degree in Indian climate.")
    if data.home_energy.lpg_cylinders_per_month > 1:
        recs.append("🔥 Switch to an induction cooktop for some meals — reduces LPG usage and saves money long-term.")
    if data.home_energy.renewable_energy_percent < 20:
        recs.append("☀️ Rooftop solar is cheaper than ever in India — a 1kW system saves ~1.2 tonnes CO₂/year.")
    if data.food.diet_type in ["omnivore", "heavy_meat"]:
        recs.append("🥦 Going vegetarian even 3 days a week can reduce your food footprint by 25% — common in Indian households.")
    if data.food.rice_meals_per_week > 10:
        recs.append("🍚 Rice has high methane impact. Try mixing in millets (jowar/bajra) — healthier and lower emissions.")
    if data.food.food_waste_level == "high":
        recs.append("🍽️ Indian households waste ~50 kg food/year. Meal planning and composting can save both emissions and money.")
    if data.shopping.plastic_usage in ["medium", "high"]:
        recs.append("♻️ India banned many single-use plastics in 2022. Use cloth bags and steel bottles — saves ~80 kg CO₂/year.")
    if not data.shopping.buys_secondhand and data.shopping.clothing_items_per_month > 3:
        recs.append("👕 Try local thrift stores or apps like Floh/CoutLoot — cuts fashion emissions by 70%.")
    if data.lifestyle.recycling_habit != "always":
        recs.append("♻️ Segregate waste at home — Indian cities with good recycling cut landfill emissions by half.")
    if data.lifestyle.water_liters_per_day > 200:
        recs.append("💧 Fix leaking taps and use bucket instead of shower — saves water & the energy to treat it.")
    if len(recs) < 3:
        recs.append("🌳 Plant a tree or support urban forestry initiatives — 1 tree absorbs ~20 kg CO₂/year.")
        recs.append("📱 Log daily habits in EcoTrack AI to track your progress and earn badges!")
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
