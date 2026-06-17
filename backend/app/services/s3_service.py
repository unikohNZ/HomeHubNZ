import uuid
from typing import Optional

from app.core.config import get_settings

settings = get_settings()


class S3Service:
    def __init__(self):
        try:
            import boto3
            from botocore.exceptions import ClientError
        except ImportError as exc:
            raise RuntimeError(
                "boto3 is required for S3 uploads. Install with: pip install boto3"
            ) from exc

        self._client_error = ClientError
        self.client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
            region_name=settings.AWS_REGION,
        )
        self.bucket = settings.S3_BUCKET_NAME

    def generate_presigned_url(
        self, file_name: str, file_type: str, folder: str = "uploads"
    ) -> dict:
        key = f"{folder}/{uuid.uuid4()}/{file_name}"
        try:
            url = self.client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.bucket,
                    "Key": key,
                    "ContentType": file_type,
                },
                ExpiresIn=3600,
            )
            return {
                "upload_url": url,
                "file_key": key,
                "public_url": f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{key}",
            }
        except self._client_error as e:
            raise RuntimeError(f"Failed to generate presigned URL: {e}") from e

    def delete_file(self, key: str) -> bool:
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except self._client_error:
            return False
