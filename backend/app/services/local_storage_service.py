"""Local filesystem storage for development. S3-compatible folder layout."""

from __future__ import annotations

import uuid
from pathlib import Path

from app.core.config import get_settings

settings = get_settings()


class LocalStorageService:
    FOLDERS = ("profiles", "properties", "messages", "maintenance", "documents")

    def __init__(self) -> None:
        self.root = Path(settings.UPLOAD_DIR)
        self._ensure_dirs()

    def _ensure_dirs(self) -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        for folder in self.FOLDERS:
            (self.root / folder).mkdir(parents=True, exist_ok=True)

    def public_url(self, relative_path: str) -> str:
        """Return URL path served by StaticFiles mount."""
        clean = relative_path.replace("\\", "/").lstrip("/")
        return f"{settings.PUBLIC_BASE_URL.rstrip('/')}/uploads/{clean}"

    async def save_bytes(
        self,
        data: bytes,
        *,
        folder: str,
        filename: str,
    ) -> str:
        safe_name = f"{uuid.uuid4().hex}_{filename}"
        rel = f"{folder}/{safe_name}"
        dest = self.root / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return self.public_url(rel)


local_storage = LocalStorageService()
