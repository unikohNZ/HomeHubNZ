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

## Database migrations

### Fresh database

```bash
cd backend
alembic upgrade head
```

### Existing database (tables already created via `create_all`)

If PostgreSQL already has tables but Alembic has never been run:

```bash
cd backend
alembic stamp head    # mark current schema as migrated
alembic upgrade head  # apply any newer migrations
```

## Seed demo data

Demo data lets the mobile app work immediately with `EXPO_PUBLIC_USE_MOCK=false`.

### Manual seed (recommended)

```bash
cd backend
python scripts/seed.py
```

Roles only (no demo users):

```bash
python scripts/seed.py --roles-only
```

### Automatic seed on startup

Set in `backend/.env`:

```env
SEED_DEMO_ON_STARTUP=true
```

Then start the API — demo data is seeded idempotently on each startup (no duplicates).

### Demo accounts

| Role       | Email                      | Password |
|------------|----------------------------|----------|
| Flatmate   | flatmate@homehub.co.nz     | 123456   |
| Landlord   | landlord@homehub.co.nz     | 123456   |
| Contractor | contractor@homehub.co.nz   | 123456   |

### What gets seeded

- **Users** — flatmate, landlord, contractor (bcrypt-hashed passwords)
- **Properties** — Mount Maunganui Apartment, Tauranga Townhouse, Papamoa Beach House
- **Tenancy** — flatmate assigned to Mount Maunganui (flatmate + tenant records)
- **Lease & rent** — paid, upcoming, and overdue payments
- **House rules** — no smoking, quiet hours, rent due Friday, shared areas
- **Chat rooms** — flatmate↔landlord, flatmate group, contractor maintenance
- **Messages** — realistic conversation in each room
- **Notifications** — rent due, new message, join approved, maintenance update
- **Maintenance** — leaking tap, heat pump issue, fence repair

Running the seed script multiple times is safe — existing records are updated, not duplicated.

## Run the API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: http://localhost:8000/health
- Docs: http://localhost:8000/docs

On startup the app creates any missing tables and seeds default roles automatically.

## Foundation Models

| Model | Table | Description |
|-------|-------|-------------|
| `Role` | `roles` | RBAC roles (tenant, landlord, etc.) |
| `User` | `users` | Platform users |
| `Property` | `properties` | Rental properties |
| `Lease` | `leases` | Lease agreements (parent of rent payments) |
| `RentPayment` | `rent_payments` | Rent ledger entries |
| `MaintenanceRequest` | `maintenance_requests` | Maintenance tickets |

## Frontend (real API mode)

In `frontend/.env`:

```env
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

Restart Expo with cache clear: `npx expo start --web -c`

Log in as **landlord@homehub.co.nz** or **flatmate@homehub.co.nz** with password **123456**.
