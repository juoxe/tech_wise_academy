"""Training: the results of the rounds of the games without saved learning progress.

SQL-Bausteine, Code beurteilen and Memory store one row per finished round.

Revision ID: 0010
Revises: 0009
Create Date: 2026-11-05
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0010"
down_revision: str | None = "0009"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "round_results",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("profile_id", sa.Uuid(), nullable=False),
        sa.Column("game", sa.Text(), nullable=False),
        sa.Column("difficulty", sa.Integer(), nullable=False),
        sa.Column("solved", sa.Integer(), nullable=False),
        sa.Column("total", sa.Integer(), nullable=False),
        sa.Column(
            "played_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint("game IN ('sql', 'code', 'memory')", name="round_results_game_values"),
        sa.CheckConstraint("difficulty BETWEEN 1 AND 3", name="round_results_difficulty_values"),
        sa.CheckConstraint(
            "solved >= 0 AND total >= 1 AND solved <= total",
            name="round_results_counts_valid",
        ),
    )
    op.create_index("ix_round_results_profile_id", "round_results", ["profile_id"])


def downgrade() -> None:
    op.drop_index("ix_round_results_profile_id", table_name="round_results")
    op.drop_table("round_results")
