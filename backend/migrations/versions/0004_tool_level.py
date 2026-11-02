"""Learning content: the level of each tool (1 = know, 2 = intermediate, 3 = expert).

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-27
"""

import json
from collections.abc import Sequence
from importlib import resources

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _levels() -> list[dict]:
    text = resources.files("tech_wise_academy.learning_content").joinpath("seed_tools.json")
    tools = json.loads(text.read_text(encoding="utf-8"))["tools"]
    return [{"key": tool["key"], "level": tool["level"]} for tool in tools]


def upgrade() -> None:
    op.add_column("tool", sa.Column("level", sa.Integer(), nullable=True))
    op.get_bind().execute(
        sa.text("UPDATE tool SET level = :level WHERE key = :key"),
        _levels(),
    )
    op.alter_column("tool", "level", nullable=False)
    op.create_check_constraint("tool_level_values", "tool", "level BETWEEN 1 AND 3")


def downgrade() -> None:
    op.drop_constraint("tool_level_values", "tool", type_="check")
    op.drop_column("tool", "level")
