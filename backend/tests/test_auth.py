import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_register_validation(client):
    response = await client.post("/api/v1/auth/register", json={
        "email": "invalid",
        "password": "short",
        "first_name": "",
        "last_name": "",
    })
    assert response.status_code == 422
