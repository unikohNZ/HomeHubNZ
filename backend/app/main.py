import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.seed import seed_roles
from app.database import AsyncSessionLocal, Base, check_database_connection, engine
from app.api.v1 import api_router
from app.models import (  # noqa: F401 — register all models with metadata
    ChatRoom,
    Document,
    EmergencyAlert,
    EmergencyContact,
    Event,
    Flatmate,
    HouseRule,
    JoinRequest,
    Lease,
    MaintenanceRequest,
    Message,
    Notification,
    Property,
    PropertyImage,
    RentPayment,
    Role,
    User,
)

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_ok = await check_database_connection()
    if db_ok:
        print("Database Connected Successfully", flush=True)
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)

            async with AsyncSessionLocal() as session:
                await seed_roles(session)
                await session.commit()

            logger.info("Database tables ready and roles seeded")
        except Exception as exc:
            logger.warning("Database startup skipped: %s", exc)
    else:
        print("Database Connection Failed", flush=True)

    yield

    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Property Management Platform for New Zealand",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {"message": "HomeHub NZ API Running Successfully"}


@app.get("/health")
async def health_check():
    db_ok = await check_database_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "database": "connected" if db_ok else "unavailable",
    }
