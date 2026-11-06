"""Training: the importance score a player gives to a tool (TWA-14.2).

Only scores that differ from the default are stored; a tool without a row has the default score.

Revision ID: 0012
Revises: 0011
Create Date: 2026-11-06
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0012"
down_revision: str | None = "0011"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tool_priority",
        sa.Column("profile_id", sa.Uuid(), primary_key=True),
        sa.Column("tool_key", sa.Text(), primary_key=True),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.CheckConstraint("score BETWEEN 0 AND 4", name="tool_priority_score_range"),
    )


def downgrade() -> None:
    op.drop_table("tool_priority")
