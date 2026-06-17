from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.permissions import Permission, require_permissions
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService

router = APIRouter()


@router.get("/property/{property_id}", response_model=List[DocumentResponse])
async def list_documents(
    property_id: int,
    current_user: User = Depends(require_permissions(Permission.PROPERTY_READ)),
    db: AsyncSession = Depends(get_db),
):
    service = DocumentService(db)
    return await service.list_for_property(property_id, current_user)


@router.post("/property/{property_id}", response_model=DocumentResponse, status_code=201)
async def upload_document(
    property_id: int,
    file: UploadFile = File(...),
    name: str | None = Form(None),
    current_user: User = Depends(require_permissions(Permission.PROPERTY_UPDATE)),
    db: AsyncSession = Depends(get_db),
):
    service = DocumentService(db)
    return await service.upload(property_id, file, current_user, name)


@router.delete("/{document_id}", response_model=MessageResponse)
async def delete_document(
    document_id: int,
    current_user: User = Depends(require_permissions(Permission.PROPERTY_UPDATE)),
    db: AsyncSession = Depends(get_db),
):
    service = DocumentService(db)
    await service.delete(document_id, current_user)
    return MessageResponse(message="Document deleted")
