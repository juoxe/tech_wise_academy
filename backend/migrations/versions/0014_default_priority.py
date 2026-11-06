"""Learning content: the level of a tool becomes its default priority (TWA-14.8).

Decided by J on 2026-11-06: the levels Kennen, Intermediate and Expert are turned into start
priorities and then removed. Kennen (1) becomes Hoch (3), Intermediate (2) becomes Normal (2) and
Expert (3) becomes Niedrig (1). A player's own score overrides the default priority.

Revision ID: 0014
Revises: 0013
Create Date: 2026-11-06
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0014"
down_revision: str | None = "0013"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("tool", sa.Column("default_priority", sa.Integer(), nullable=True))
    op.get_bind().execute(
        sa.text(
            "UPDATE tool SET default_priority = CASE level WHEN 1 THEN 3 WHEN 2 THEN 2 ELSE 1 END"
        )
    )
    op.alter_column("tool", "default_priority", nullable=False)
    op.create_check_constraint(
        "tool_default_priority_values", "tool", "default_priority BETWEEN 0 AND 4"
    )
    op.drop_constraint("tool_level_values", "tool", type_="check")
    op.drop_column("tool", "level")


def downgrade() -> None:
    op.add_column("tool", sa.Column("level", sa.Integer(), nullable=True))
    op.get_bind().execute(
        sa.text(
            "UPDATE tool SET level = CASE WHEN default_priority >= 3 THEN 1 "
            "WHEN default_priority = 2 THEN 2 ELSE 3 END"
        )
    )
    op.alter_column("tool", "level", nullable=False)
    op.create_check_constraint("tool_level_values", "tool", "level BETWEEN 1 AND 3")
    op.drop_constraint("tool_default_priority_values", "tool", type_="check")
    op.drop_column("tool", "default_priority")
