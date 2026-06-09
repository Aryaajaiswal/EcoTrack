from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class TransportationData(BaseModel):
    car_km_per_week: float = Field(0, ge=0)
    car_type: str = Field("petrol")
    bike_km_per_week: float = Field(0, ge=0)
    public_transport_km_per_week: float = Field(0, ge=0)
    flights_per_year: int = Field(0, ge=0)
    flight_type: str = Field("domestic")

class HomeEnergyData(BaseModel):
    electricity_kwh_per_month: float = Field(0, ge=0)
    renewable_energy_percent: float = Field(0, ge=0, le=100)
    ac_hours_per_day: float = Field(0, ge=0, le=24)
    num_people_in_home: int = Field(1, ge=1, le=20)

class FoodData(BaseModel):
    diet_type: str = Field("omnivore")
    dairy_servings_per_week: float = Field(7, ge=0)
    food_waste_level: str = Field("medium")

class ShoppingData(BaseModel):
    clothing_items_per_month: int = Field(2, ge=0)
    online_orders_per_month: int = Field(4, ge=0)
    plastic_usage: str = Field("medium")
    buys_secondhand: bool = False

class LifestyleData(BaseModel):
    water_liters_per_day: float = Field(150, ge=0)
    recycling_habit: str = Field("sometimes")
    waste_kg_per_week: float = Field(5, ge=0)
    uses_renewable_energy: bool = False

class CarbonCalculationInput(BaseModel):
    transportation: TransportationData = TransportationData()
    home_energy: HomeEnergyData = HomeEnergyData()
    food: FoodData = FoodData()
    shopping: ShoppingData = ShoppingData()
    lifestyle: LifestyleData = LifestyleData()

class CategoryBreakdown(BaseModel):
    transportation: float
    home_energy: float
    food: float
    shopping: float
    lifestyle: float

class CarbonCalculationResult(BaseModel):
    total_co2_kg_per_year: float
    monthly_co2_kg: float
    daily_co2_kg: float
    category_breakdown: CategoryBreakdown
    sustainability_score: int
    eco_level: str
    percentile_better_than: float
    recommendations: List[str]
    potential_savings_kg: float

class ActivityLogCreate(BaseModel):
    category: str
    activity_type: str
    co2_kg: float
    description: str
