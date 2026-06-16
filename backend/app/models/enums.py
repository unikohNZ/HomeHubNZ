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
    UPCOMING = "upcoming"
    PAID = "paid"
    PENDING = "pending"
    OVERDUE = "overdue"
    DUE_TODAY = "due_today"


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


class JoinRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class HouseRuleType(str, enum.Enum):
    SMOKING = "smoking"
    VISITORS = "visitors"
    QUIET_HOURS = "quiet_hours"
    CLEANING = "cleaning"
    PETS = "pets"
    OTHER = "other"


class DocumentType(str, enum.Enum):
    LEASE = "lease"
    BOND = "bond"
    INSPECTION = "inspection"
    PROPERTY = "property"
    OTHER = "other"


class ChatRoomType(str, enum.Enum):
    FLATMATE_GROUP = "flatmate_group"
    LANDLORD = "landlord"
    PRIVATE = "private"
    MAINTENANCE = "maintenance"


class MessageType(str, enum.Enum):
    TEXT = "text"
    IMAGE = "image"
    DOCUMENT = "document"


class NotificationType(str, enum.Enum):
    MESSAGE = "message"
    RENT = "rent"
    MAINTENANCE = "maintenance"
    PROPERTY = "property"
    EMERGENCY = "emergency"
    JOIN_REQUEST = "join_request"
    HOUSE_RULES = "house_rules"
    GENERAL = "general"


class BillStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class BillType(str, enum.Enum):
    ELECTRICITY = "electricity"
    WATER = "water"
    INTERNET = "internet"
    GAS = "gas"
    OTHER = "other"


class InspectionStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class EmergencyAlertType(str, enum.Enum):
    EARTHQUAKE = "earthquake"
    TSUNAMI = "tsunami"
    FLOOD = "flood"
    STORM = "storm"
    FIRE = "fire"
    GENERAL = "general"


class EmergencySeverity(str, enum.Enum):
    NORMAL = "normal"
    WATCH = "watch"
    WARNING = "warning"
    EMERGENCY = "emergency"
