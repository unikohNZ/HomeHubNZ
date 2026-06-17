from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.enums import DocumentType


class DocumentResponse(BaseModel):
    id: int
    property_id: int
    uploaded_by: int
    name: str
    file_url: str
    file_type: str
    document_type: DocumentType
    file_size: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentCreate(BaseModel):
    property_id: int
    name: str
    document_type: DocumentType = DocumentType.OTHER
