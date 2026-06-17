from typing import List

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.models.property import Property
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.services.supabase_storage_service import storage_service


class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _assert_property_access(self, property_id: int, user: User) -> Property:
        result = await self.db.execute(select(Property).where(Property.id == property_id))
        prop = result.scalar_one_or_none()
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        role = user.role.name if user.role else ""
        if prop.owner_id != user.id and role not in ("admin", "flatmate", "tenant"):
            # flatmates/tenants may view documents for their property via flatmate check elsewhere
            if role not in ("landlord", "property_manager", "admin"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return prop

    async def list_for_property(self, property_id: int, user: User) -> List[DocumentResponse]:
        await self._assert_property_access(property_id, user)
        result = await self.db.execute(
            select(Document)
            .where(Document.property_id == property_id)
            .order_by(Document.created_at.desc())
        )
        return [DocumentResponse.model_validate(d) for d in result.scalars().all()]

    async def upload(
        self,
        property_id: int,
        file: UploadFile,
        user: User,
        name: str | None = None,
    ) -> DocumentResponse:
        prop = await self._assert_property_access(property_id, user)
        if prop.owner_id != user.id and user.role.name != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can upload")

        content = await file.read()
        filename = file.filename or "document.pdf"
        ext = filename.split(".")[-1].lower()
        file_type = file.content_type or "application/octet-stream"
        url = await storage_service.upload_document(content, property_id, filename, file_type)

        doc = Document(
            property_id=property_id,
            uploaded_by=user.id,
            name=name or filename,
            file_url=url,
            file_type=ext,
            file_size=len(content),
        )
        self.db.add(doc)
        await self.db.flush()
        await self.db.refresh(doc)
        return DocumentResponse.model_validate(doc)

    async def delete(self, document_id: int, user: User) -> None:
        result = await self.db.execute(select(Document).where(Document.id == document_id))
        doc = result.scalar_one_or_none()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        prop = await self._assert_property_access(doc.property_id, user)
        if prop.owner_id != user.id and user.role.name != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        await self.db.delete(doc)
        await self.db.flush()
