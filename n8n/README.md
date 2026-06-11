# n8n Automation Workflows

HomeHub NZ uses n8n for scheduled automation tasks. Access the n8n editor at `http://localhost:5678`.

## Workflows

| Workflow | Schedule | Endpoint |
|----------|----------|----------|
| Rent Reminder | Daily 8:00 AM NZST | `POST /api/v1/webhooks/rent-reminder` |
| Maintenance Notify | On status change | `POST /api/v1/webhooks/maintenance-notify` |
| Inspection Reminder | Daily 9:00 AM NZST | `POST /api/v1/webhooks/inspection-reminder` |
| Lease Expiry | Daily 9:00 AM NZST | `POST /api/v1/webhooks/lease-expiry` |

## Authentication

All webhook calls require the `X-Webhook-Secret` header matching the `WEBHOOK_SECRET` environment variable.

## Import Workflows

1. Open n8n at http://localhost:5678
2. Go to Workflows → Import from File
3. Import each JSON file from `n8n/workflows/`

## Architecture

```
┌─────────────┐     Cron Trigger      ┌──────────────┐
│    n8n      │ ──────────────────►   │  HomeHub API │
│  Scheduler  │     HTTP Webhook      │   Webhooks   │
└─────────────┘                       └──────┬───────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Notifications  │
                                    │  Push + In-App  │
                                    └─────────────────┘
```

## Environment Variables (n8n)

Set these in n8n credentials or workflow variables:

- `HOMEHUB_API_URL` — `http://api:8000/api/v1`
- `WEBHOOK_SECRET` — matches backend config
