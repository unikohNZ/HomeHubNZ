# Getting Started with HomeHub NZ

## Prerequisites

- Docker Desktop
- Node.js 20+
- Python 3.12+ (optional, for local backend dev)
- Expo Go app on your phone (for mobile testing)

## 1. Clone and Configure

```bash
cd HomeHubNZ
cp .env.example .env
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
```

## 2. Start Backend Services

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- FastAPI API on port 8000
- n8n on port 5678

Verify: http://localhost:8000/docs

## 3. Start Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera app (iOS).

## 4. Generate App Assets

Before App Store / Play Store submission, generate icons:

```bash
cd mobile
npx expo install @expo/image-utils
# Place a 1024x1024 icon.png in assets/ then:
npx expo prebuild
```

## 5. Import n8n Workflows

1. Open http://localhost:5678 (admin / admin by default)
2. Import workflows from `n8n/workflows/`
3. Set environment variables: `HOMEHUB_API_URL`, `WEBHOOK_SECRET`

## 6. Test Authentication

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@test.nz",
    "password": "password123",
    "first_name": "John",
    "last_name": "Smith",
    "role": "landlord"
  }'
```

## Project Phases Completed

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | Done | Architecture, folder structure, database schema |
| 2 | Done | Backend APIs with Clean Architecture |
| 3 | Done | Mobile frontend with Expo Router |
| 4 | Done | WebSocket real-time messaging |
| 5 | Done | Push notification system |
| 6 | Done | AI services module |
| 7 | Done | n8n automation workflows |
| 8 | Done | Docker, CI/CD pipeline |

## Architecture Highlights

- **Clean Architecture** with Repository + Service layers
- **RBAC** with 6 user roles and granular permissions
- **JWT** access + refresh token rotation
- **WebSockets** for WhatsApp-style messaging
- **S3** presigned uploads for secure file handling
- **AI layer** pluggable for OpenAI/Claude
- **n8n** for scheduled automation (rent, inspection, lease reminders)
