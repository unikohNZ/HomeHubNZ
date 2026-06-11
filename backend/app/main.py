from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import select

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.database import AsyncSessionLocal, engine
from app.core.database import Base
from app.models.enums import UserRole
from app.models.role import Role
from app.websocket.chat import router as ws_router

settings = get_settings()
limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        for role_name in UserRole:
            result = await db.execute(select(Role).where(Role.name == role_name.value))
            if not result.scalar_one_or_none():
                db.add(Role(name=role_name.value, description=f"{role_name.value.replace('_', ' ').title()} role"))
        await db.commit()

    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Property Management Platform for New Zealand",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
app.include_router(ws_router)


@app.get("/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    return {"status": "healthy", "app": settings.APP_NAME, "version": "1.0.0"}
