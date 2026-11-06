"""Learning content: a tool can be marked as deleted (soft delete, TWA-9.4).

A deleted tool stays in the table, so saved progress, embeddings and interview sets that refer to
its key never dangle; the API hides it everywhere.

Revision ID: 0011
Revises: 0010
Create Date: 2026-11-06
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0011"
down_revision: str | None = "0010"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("tool", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("tool", "deleted_at")
