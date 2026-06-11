from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.user import User
from app.services.s3_service import S3Service

router = APIRouter()


class PresignRequest(BaseModel):
    file_name: str
    file_type: str
    folder: str = "uploads"


class ConfirmUploadRequest(BaseModel):
    file_key: str
    file_name: str
    file_type: str
    file_size: int
    property_id: int | None = None
    document_type: str = "other"


@router.post("/presign")
async def get_presigned_url(
    data: PresignRequest,
    current_user: User = Depends(get_current_user),
):
    s3 = S3Service()
    return s3.generate_presigned_url(data.file_name, data.file_type, data.folder)


@router.post("/confirm")
async def confirm_upload(
    data: ConfirmUploadRequest,
    current_user: User = Depends(get_current_user),
):
    return {
        "message": "Upload confirmed",
        "file_key": data.file_key,
        "public_url": f"https://homehub-nz-uploads.s3.ap-southeast-2.amazonaws.com/{data.file_key}",
    }
