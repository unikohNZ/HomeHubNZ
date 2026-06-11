from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int


class MessageResponse(BaseModel):
    message: str
    success: bool = True


class CalendarEvent(BaseModel):
    id: str
    title: str
    date: str
    event_type: str
    color: str
    metadata: Optional[dict] = None
