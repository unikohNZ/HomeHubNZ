"""Register all ORM models so Alembic and create_all discover every table."""

from app.models.bill import Bill, Expense
from app.models.chat import ChatRoom, Message, ReadReceipt
from app.models.document import Document
from app.models.emergency import EmergencyAlert, EmergencyContact
from app.models.event import Event
from app.models.flatmate import Flatmate
from app.models.house_rule import HouseRule, HouseRuleAcceptance
from app.models.inspection import Inspection, InspectionReport
from app.models.join_request import JoinRequest
from app.models.lease import Lease
from app.models.maintenance import MaintenanceRequest
from app.models.notification import Notification
from app.models.property import Property
from app.models.property_image import PropertyImage
from app.models.rent import RentPayment
from app.models.role import Role
from app.models.task import Task
from app.models.tenant import Tenant
from app.models.user import User

__all__ = [
    "Role",
    "User",
    "Property",
    "PropertyImage",
    "Lease",
    "RentPayment",
    "MaintenanceRequest",
    "Flatmate",
    "Tenant",
    "JoinRequest",
    "HouseRule",
    "HouseRuleAcceptance",
    "Event",
    "EmergencyContact",
    "EmergencyAlert",
    "Document",
    "ChatRoom",
    "Message",
    "ReadReceipt",
    "Notification",
    "Bill",
    "Expense",
    "Inspection",
    "InspectionReport",
    "Task",
]
