# Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Property : owns
    User ||--o{ Tenant : "is tenant"
    User ||--o{ Flatmate : "is flatmate"
    User ||--o{ Contractor : "is contractor"
    User }o--|| Role : has
    Property ||--o{ Lease : has
    Property ||--o{ MaintenanceRequest : has
    Property ||--o{ Inspection : has
    Property ||--o{ Document : has
    Lease ||--o{ RentPayment : has
    Property ||--o{ Bill : has
    Bill ||--o{ Expense : has
    MaintenanceRequest ||--o{ MaintenanceComment : has
    Inspection ||--o{ InspectionReport : has
    ChatRoom ||--o{ Message : contains
    User ||--o{ Message : sends
    User ||--o{ Notification : receives
    Property ||--o{ Task : has
    User ||--o{ ActivityLog : generates
```

## Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| users | email (unique) | Login lookup |
| users | role_id | RBAC queries |
| properties | owner_id | Landlord dashboard |
| rent_payments | lease_id, due_date | Rent ledger |
| rent_payments | status | Overdue queries |
| maintenance_requests | property_id, status | Dashboard |
| messages | room_id, created_at | Chat history |
| notifications | user_id, is_read | Notification center |
| activity_logs | user_id, created_at | Audit trail |

## Enums

- **UserRole**: tenant, flatmate, landlord, property_manager, contractor, admin
- **PropertyType**: house, apartment, unit, townhouse, studio
- **RentFrequency**: weekly, fortnightly, monthly
- **RentStatus**: paid, pending, overdue
- **BillType**: power, water, internet, gas, other
- **MaintenanceStatus**: submitted, reviewing, assigned, in_progress, completed
- **MaintenancePriority**: low, medium, high, urgent
- **InspectionStatus**: scheduled, completed, cancelled
- **ChatRoomType**: direct, group, property, maintenance
- **NotificationType**: rent_due, rent_overdue, maintenance, message, inspection, announcement, lease_expiry
- **TaskStatus**: pending, in_progress, completed
