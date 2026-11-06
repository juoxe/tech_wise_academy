"""Programming languages are an area of their own; the paradigm is a feature (TWA-7.11).

Until now the five paradigms were categories next to the areas DevOps, Backend and so on. Now the
category of a language is `LANGUAGE` and the paradigm is the separate column `tool.paradigm`. The
seed file keeps the old values; this migration converts them on every database.

Revision ID: 0013
Revises: 0012
Create Date: 2026-11-06
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0013"
down_revision: str | None = "0012"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

AREAS = ("DEVOPS", "BACKEND", "FRONTEND", "SECURITY", "AI_DATA")
PARADIGMS = ("OBJECT_ORIENTED", "FUNCTIONAL", "PROCEDURAL", "DECLARATIVE", "MULTI_PARADIGM")


def _in(column: str, values: Sequence[str]) -> str:
    return f"{column} IN ({', '.join(repr(value) for value in values)})"


def upgrade() -> None:
    connection = op.get_bind()
    op.add_column("tool", sa.Column("paradigm", sa.Text(), nullable=True))
    # The old check does not know `LANGUAGE` yet, so it goes first and the new one comes after.
    op.drop_constraint("tool_category_values", "tool", type_="check")
    connection.execute(
        sa.text(f"UPDATE tool SET paradigm = category WHERE {_in('category', PARADIGMS)}")
    )
    connection.execute(sa.text("UPDATE tool SET category = 'LANGUAGE' WHERE paradigm IS NOT NULL"))
    op.create_check_constraint(
        "tool_category_values", "tool", _in("category", AREAS + ("LANGUAGE",))
    )
    op.create_check_constraint(
        "tool_paradigm_values",
        "tool",
        f"(category = 'LANGUAGE') = (paradigm IS NOT NULL) "
        f"AND (paradigm IS NULL OR {_in('paradigm', PARADIGMS)})",
    )


def downgrade() -> None:
    connection = op.get_bind()
    op.drop_constraint("tool_paradigm_values", "tool", type_="check")
    op.drop_constraint("tool_category_values", "tool", type_="check")
    connection.execute(sa.text("UPDATE tool SET category = paradigm WHERE paradigm IS NOT NULL"))
    op.create_check_constraint("tool_category_values", "tool", _in("category", AREAS + PARADIGMS))
    op.drop_column("tool", "paradigm")
