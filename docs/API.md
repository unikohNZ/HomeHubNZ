# HomeHub NZ API Reference

Base URL: `https://api.homehub.nz/api/v1`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset with token |
| POST | `/auth/verify-email` | Verify email address |
| GET | `/auth/me` | Current user profile |

## Properties

| Method | Endpoint | Roles |
|--------|----------|-------|
| GET | `/properties` | landlord, property_manager, admin |
| POST | `/properties` | landlord, property_manager, admin |
| GET | `/properties/{id}` | all assigned roles |
| PUT | `/properties/{id}` | landlord, property_manager, admin |
| DELETE | `/properties/{id}` | landlord, admin |
| POST | `/properties/{id}/tenants` | landlord, property_manager |
| POST | `/properties/{id}/flatmates` | tenant, landlord |
| POST | `/properties/{id}/documents` | landlord, property_manager |

## Rent

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rent/ledger` | Rent ledger entries |
| GET | `/rent/analytics` | Rent analytics dashboard |
| POST | `/rent/payments` | Submit payment |
| PUT | `/rent/payments/{id}/approve` | Approve payment (landlord) |
| GET | `/rent/outstanding` | Outstanding balances |

## Bills

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bills` | List bills |
| POST | `/bills` | Create bill |
| POST | `/bills/{id}/split` | Custom split |
| PUT | `/bills/{id}/pay` | Mark share paid |

## Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance` | List requests |
| POST | `/maintenance` | Submit request |
| PUT | `/maintenance/{id}` | Update status |
| POST | `/maintenance/{id}/comments` | Add comment |
| POST | `/maintenance/{id}/assign` | Assign contractor |

## Inspections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inspections` | List inspections |
| POST | `/inspections` | Schedule inspection |
| POST | `/inspections/{id}/report` | Create report |
| GET | `/inspections/{id}/report/pdf` | Download PDF |

## Messaging

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/rooms` | List chat rooms |
| POST | `/chat/rooms` | Create room |
| GET | `/chat/rooms/{id}/messages` | Message history |
| WS | `/ws/chat/{room_id}` | Real-time messaging |

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| PUT | `/notifications/{id}/read` | Mark as read |
| PUT | `/notifications/read-all` | Mark all read |
| POST | `/notifications/register-device` | Register push token |

## Calendar

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/calendar/events` | All calendar events |

## AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/maintenance/suggest` | Maintenance suggestions |
| POST | `/ai/maintenance/categorize` | Categorize issue |
| GET | `/ai/insights/{property_id}` | Property insights |
| POST | `/ai/chat` | AI chat assistant |

## Webhooks (n8n)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/rent-reminder` | Daily rent check |
| POST | `/webhooks/maintenance-notify` | Maintenance alerts |
| POST | `/webhooks/inspection-reminder` | Inspection reminders |
| POST | `/webhooks/lease-expiry` | Lease expiry alerts |

## Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/uploads/presign` | Get S3 presigned URL |
| POST | `/uploads/confirm` | Confirm upload |
