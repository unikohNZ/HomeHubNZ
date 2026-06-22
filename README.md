# HomeHub NZ

A Smart Property, Tenant, Flatmate, and Maintenance Management Platform for New Zealand.

## Project Structure

```
homehub-nz/
├── backend/          # FastAPI REST API (Clean Architecture)
├── frontend/         # React Native mobile app (Expo)
├── docker/           # Docker & deployment configuration
├── docs/             # Architecture & planning documentation
├── n8n/              # Automation workflow definitions
├── .env.example      # Root environment variables
└── docker-compose.yml
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native, Expo, TypeScript, Expo Router |
| Backend | FastAPI, Python, SQLAlchemy, Alembic, Pydantic |
| Database | PostgreSQL |
| Cloud | AWS S3, AWS EC2 |
| Realtime | WebSockets |
| Notifications | Expo Push, Firebase Cloud Messaging |
| Automation | n8n |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Quick Start

```bash
# 1. Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Start services
docker compose up -d

# 3. Seed demo data (first time)
cd backend && python scripts/seed.py

# 4. Run mobile app (real API mode)
cd frontend && npm install && npx expo start --web -c
```

### Demo login (after seed)

| Role     | Email                    | Password |
|----------|--------------------------|----------|
| Flatmate | flatmate@homehub.co.nz   | 123456   |
| Landlord | landlord@homehub.co.nz   | 123456   |

Set `EXPO_PUBLIC_USE_MOCK=false` in `frontend/.env`. See [backend/README.md](backend/README.md) for migrations, Alembic `stamp head`, and full seed documentation.

## Documentation

- [Database Schema Plan](docs/DATABASE_SCHEMA.md)
- API documentation: `http://localhost:8000/docs` (when backend is running)

## User Roles

Tenant · Flatmate · Landlord · Property Manager · Contractor · Admin

## License

MIT
