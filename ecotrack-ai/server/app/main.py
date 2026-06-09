"""
EcoTrack AI — FastAPI Backend Entry Point
Production-ready Python backend for carbon footprint tracking.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config.database import connect_to_mongo, close_mongo_connection
from app.config.settings import settings
from app.routes import auth, users, carbon, ai_coach, challenges, leaderboard

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🌿 EcoTrack AI Backend Starting...")
    await connect_to_mongo()
    logger.info("🚀 Server ready!")
    yield
    logger.info("🛑 Shutting down EcoTrack AI Backend...")
    await close_mongo_connection()


app = FastAPI(
    title="EcoTrack AI API",
    description="AI-powered Carbon Footprint Awareness Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ecotrack-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(carbon.router, prefix="/api/v1")
app.include_router(ai_coach.router, prefix="/api/v1")
app.include_router(challenges.router, prefix="/api/v1")
app.include_router(leaderboard.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"app": "EcoTrack AI", "version": "1.0.0", "status": "running", "message": "🌿 Building a greener future, one API call at a time."}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected", "environment": settings.environment}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "An internal server error occurred. Please try again."})
