"""Training: the game 'clearing' (Karten abräumen) gets its own progress per tool.

Revision ID: 0005
Revises: 0004
Create Date: 2026-10-27
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("learning_progress_game_values", "learning_progress", type_="check")
    op.create_check_constraint(
        "learning_progress_game_values",
        "learning_progress",
        "game IN ('level0', 'clearing')",
    )


def downgrade() -> None:
    op.drop_constraint("learning_progress_game_values", "learning_progress", type_="check")
    op.create_check_constraint(
        "learning_progress_game_values",
        "learning_progress",
        "game IN ('level0')",
    )
