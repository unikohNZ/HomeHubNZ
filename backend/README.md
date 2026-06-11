# HomeHub NZ — Backend

FastAPI backend with PostgreSQL, SQLAlchemy 2.0 (async), and Alembic.

## Prerequisites

- Python 3.12+
- PostgreSQL 16 (via Docker recommended)

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
```

## Start PostgreSQL

From the project root:

```bash
docker compose up -d db
```

## Run the API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: http://localhost:8000/health
- Docs: http://localhost:8000/docs

## Migrations

```bash
alembic upgrade head
```

Create a new migration after model changes:

```bash
alembic revision --autogenerate -m "describe change"
```

## Foundation Models

| Model | Table | Description |
|-------|-------|-------------|
| `Role` | `roles` | RBAC roles (tenant, landlord, etc.) |
| `User` | `users` | Platform users |
| `Property` | `properties` | Rental properties |
| `Lease` | `leases` | Lease agreements (parent of rent payments) |
| `RentPayment` | `rent_payments` | Rent ledger entries |
| `MaintenanceRequest` | `maintenance_requests` | Maintenance tickets |

On startup the app creates tables and seeds default roles automatically.
