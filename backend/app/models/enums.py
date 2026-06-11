import enum


class UserRole(str, enum.Enum):
    TENANT = "tenant"
    FLATMATE = "flatmate"
    LANDLORD = "landlord"
    PROPERTY_MANAGER = "property_manager"
    CONTRACTOR = "contractor"
    ADMIN = "admin"


class PropertyType(str, enum.Enum):
    HOUSE = "house"
    APARTMENT = "apartment"
    UNIT = "unit"
    TOWNHOUSE = "townhouse"
    STUDIO = "studio"


class RentFrequency(str, enum.Enum):
    WEEKLY = "weekly"
    FORTNIGHTLY = "fortnightly"
    MONTHLY = "monthly"


class RentStatus(str, enum.Enum):
    PAID = "paid"
    PENDING = "pending"
    OVERDUE = "overdue"


class BillType(str, enum.Enum):
    POWER = "power"
    WATER = "water"
    INTERNET = "internet"
    GAS = "gas"
    OTHER = "other"


class BillStatus(str, enum.Enum):
    UNPAID = "unpaid"
    PARTIAL = "partial"
    PAID = "paid"


class MaintenanceStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    REVIEWING = "reviewing"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class MaintenancePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class InspectionStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ChatRoomType(str, enum.Enum):
    DIRECT = "direct"
    GROUP = "group"
    PROPERTY = "property"
    MAINTENANCE = "maintenance"


class NotificationType(str, enum.Enum):
    RENT_DUE = "rent_due"
    RENT_OVERDUE = "rent_overdue"
    MAINTENANCE = "maintenance"
    MESSAGE = "message"
    INSPECTION = "inspection"
    ANNOUNCEMENT = "announcement"
    LEASE_EXPIRY = "lease_expiry"
    BILL_DUE = "bill_due"
    TASK_REMINDER = "task_reminder"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class DocumentType(str, enum.Enum):
    LEASE = "lease"
    INSPECTION = "inspection"
    RECEIPT = "receipt"
    MAINTENANCE = "maintenance"
    PROPERTY = "property"
    OTHER = "other"
