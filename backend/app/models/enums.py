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
