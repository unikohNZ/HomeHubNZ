"""Add lease dates to properties table.

Revision ID: 003
Revises: 002
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("properties", sa.Column("lease_start", sa.Date(), nullable=True))
    op.add_column("properties", sa.Column("lease_end", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("properties", "lease_end")
    op.drop_column("properties", "lease_start")
