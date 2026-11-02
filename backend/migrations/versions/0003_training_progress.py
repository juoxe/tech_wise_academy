"""Training: the progress of each player per game and tool.

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-27
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "learning_progress",
        sa.Column("profile_id", sa.Uuid(), primary_key=True),
        sa.Column("game", sa.Text(), primary_key=True),
        sa.Column("tool_key", sa.Text(), primary_key=True),
        sa.Column("correct_in_a_row", sa.Integer(), nullable=False),
        sa.Column("learned", sa.Boolean(), nullable=False),
        sa.Column("correct_total", sa.Integer(), nullable=False),
        sa.Column("wrong_total", sa.Integer(), nullable=False),
        sa.CheckConstraint("game IN ('level0')", name="learning_progress_game_values"),
        sa.CheckConstraint(
            "correct_in_a_row >= 0 AND correct_total >= 0 AND wrong_total >= 0",
            name="learning_progress_counts_not_negative",
        ),
    )


def downgrade() -> None:
    op.drop_table("learning_progress")
