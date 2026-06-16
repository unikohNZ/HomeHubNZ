"""Upload files to Supabase Storage. Falls back to returning the local path in dev."""

from __future__ import annotations

import uuid
from typing import Optional

import httpx

from app.core.config import get_settings

settings = get_settings()


class SupabaseStorageService:
    def __init__(self) -> None:
        self.url = settings.SUPABASE_URL.rstrip("/") if settings.SUPABASE_URL else ""
        self.key = settings.SUPABASE_SERVICE_KEY
        self.bucket = settings.SUPABASE_STORAGE_BUCKET

    @property
    def is_configured(self) -> bool:
        return bool(self.url and self.key and self.bucket)

    async def upload_bytes(
        self,
        data: bytes,
        *,
        folder: str,
        filename: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        if not self.is_configured:
            return f"local://{folder}/{filename}"

        object_path = f"{folder}/{uuid.uuid4().hex}_{filename}"
        upload_url = f"{self.url}/storage/v1/object/{self.bucket}/{object_path}"

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                upload_url,
                content=data,
                headers={
                    "Authorization": f"Bearer {self.key}",
                    "Content-Type": content_type,
                    "x-upsert": "true",
                },
            )
            response.raise_for_status()

        return f"{self.url}/storage/v1/object/public/{self.bucket}/{object_path}"

    async def upload_profile_photo(self, data: bytes, user_id: int, ext: str = "jpg") -> str:
        return await self.upload_bytes(
            data,
            folder=f"profiles/{user_id}",
            filename=f"avatar.{ext}",
            content_type=f"image/{ext}",
        )

    async def upload_chat_attachment(
        self,
        data: bytes,
        room_id: int,
        filename: str,
        content_type: Optional[str] = None,
    ) -> str:
        return await self.upload_bytes(
            data,
            folder=f"chat/{room_id}",
            filename=filename,
            content_type=content_type or "application/octet-stream",
        )

    async def upload_document(
        self,
        data: bytes,
        property_id: int,
        filename: str,
        content_type: str = "application/pdf",
    ) -> str:
        return await self.upload_bytes(
            data,
            folder=f"documents/{property_id}",
            filename=filename,
            content_type=content_type,
        )


storage_service = SupabaseStorageService()
