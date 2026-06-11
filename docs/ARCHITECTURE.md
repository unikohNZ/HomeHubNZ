# HomeHub NZ — Architecture

## Clean Architecture Layers

```
┌──────────────────────────────────────────────┐
│              Presentation Layer               │
│  API Routes │ WebSocket Handlers │ Schemas    │
├──────────────────────────────────────────────┤
│              Application Layer                │
│  Services │ Use Cases │ DTOs                   │
├──────────────────────────────────────────────┤
│               Domain Layer                    │
│  Models │ Enums │ Business Rules              │
├──────────────────────────────────────────────┤
│            Infrastructure Layer               │
│  Repositories │ S3 │ Email │ Push │ AI        │
└──────────────────────────────────────────────┘
```

## Database Schema

See [DATABASE.md](DATABASE.md) for entity relationships and indexes.

## Authentication Flow

1. User registers → email verification token sent
2. User verifies email → account activated
3. Login → access token (15 min) + refresh token (7 days)
4. Refresh endpoint rotates tokens
5. Forgot password → reset token (1 hour expiry)

## Real-Time Messaging

WebSocket endpoint: `ws://host/ws/chat/{room_id}?token={jwt}`

Events:
- `message.send` — new message
- `message.read` — read receipt
- `typing.start` / `typing.stop`
- `presence.online` / `presence.offline`

## File Upload Flow

1. Client requests presigned URL from `/api/v1/uploads/presign`
2. Client uploads directly to S3
3. Client confirms upload via `/api/v1/uploads/confirm`
4. Backend stores metadata in `documents` table

## n8n Integration

Automation workflows call webhook endpoints:
- `POST /api/v1/webhooks/rent-reminder`
- `POST /api/v1/webhooks/maintenance-notify`
- `POST /api/v1/webhooks/inspection-reminder`
- `POST /api/v1/webhooks/lease-expiry`

Protected by `X-Webhook-Secret` header.

## Deployment

```
GitHub Actions → Lint → Test → Docker Build → EC2 Deploy
```

Services on EC2 via Docker Compose:
- `api` — FastAPI (port 8000)
- `db` — PostgreSQL (port 5432)
- `n8n` — Automation (port 5678)
- `nginx` — Reverse proxy (ports 80/443)
