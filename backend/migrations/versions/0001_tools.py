"""Tools: tool, translations, hints, examples, alternatives; seeded with the first tools.

Revision ID: 0001
Revises:
Create Date: 2026-10-25
"""

import json
import uuid
from collections.abc import Sequence
from importlib import resources

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

CATEGORIES = ("DEVOPS", "BACKEND", "FRONTEND", "SECURITY", "AI_DATA")
LANGUAGES = ("de",)
SEED_NAMESPACE = uuid.UUID("6f1c2b1e-0c0a-4e8e-9c4b-7d1f3a2b5e10")


def _tool_id(key: str) -> uuid.UUID:
    """Deterministic ids: the seed can be re-read and tested without a database."""
    return uuid.uuid5(SEED_NAMESPACE, key)


def _categories_check() -> str:
    values = ", ".join(f"'{category}'" for category in CATEGORIES)
    return f"category IN ({values})"


def _languages_check(column: str) -> str:
    values = ", ".join(f"'{language}'" for language in LANGUAGES)
    return f"{column} IN ({values})"


def upgrade() -> None:
    op.create_table(
        "tool",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("key", sa.Text(), nullable=False, unique=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("category", sa.Text(), nullable=False),
        sa.Column("documentation_url", sa.Text(), nullable=False),
        sa.Column("icon", sa.Text(), nullable=True),
        sa.CheckConstraint("key ~ '^[a-z0-9-]+$'", name="tool_key_format"),
        sa.CheckConstraint(_categories_check(), name="tool_category_values"),
    )
    op.create_table(
        "tool_translation",
        sa.Column(
            "tool_id", sa.Uuid(), sa.ForeignKey("tool.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("language", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("tool_id", "language"),
        sa.CheckConstraint(_languages_check("language"), name="tool_translation_language_values"),
    )
    op.create_table(
        "tool_hint",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "tool_id", sa.Uuid(), sa.ForeignKey("tool.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("language", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.UniqueConstraint("tool_id", "language", "position", name="tool_hint_order"),
        sa.CheckConstraint("position >= 1", name="tool_hint_position_positive"),
        sa.CheckConstraint(_languages_check("language"), name="tool_hint_language_values"),
    )
    op.create_table(
        "tool_example",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "tool_id", sa.Uuid(), sa.ForeignKey("tool.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("code", sa.Text(), nullable=False),
        sa.UniqueConstraint("tool_id", "position", name="tool_example_order"),
        sa.CheckConstraint("position >= 1", name="tool_example_position_positive"),
    )
    op.create_table(
        "tool_alternative",
        sa.Column(
            "tool_id", sa.Uuid(), sa.ForeignKey("tool.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column(
            "alternative_tool_id",
            sa.Uuid(),
            sa.ForeignKey("tool.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("tool_id", "alternative_tool_id"),
        sa.CheckConstraint("tool_id < alternative_tool_id", name="tool_alternative_stored_once"),
    )
    _seed()


def _seed() -> None:
    seed = json.loads(
        resources.files("tech_wise_academy.learning_content")
        .joinpath("seed_tools.json")
        .read_text(encoding="utf-8")
    )
    # Only the area tools fit the constraint of this revision; 0002 and 0007 add the rest.
    tools = [tool for tool in seed["tools"] if tool["category"] in CATEGORIES]
    seeded_keys = {tool["key"] for tool in tools}
    tool_table = sa.table(
        "tool",
        sa.column("id", sa.Uuid()),
        sa.column("key", sa.Text()),
        sa.column("name", sa.Text()),
        sa.column("category", sa.Text()),
        sa.column("documentation_url", sa.Text()),
        sa.column("icon", sa.Text()),
    )
    translation_table = sa.table(
        "tool_translation",
        sa.column("tool_id", sa.Uuid()),
        sa.column("language", sa.Text()),
        sa.column("summary", sa.Text()),
    )
    hint_table = sa.table(
        "tool_hint",
        sa.column("id", sa.Uuid()),
        sa.column("tool_id", sa.Uuid()),
        sa.column("language", sa.Text()),
        sa.column("position", sa.Integer()),
        sa.column("text", sa.Text()),
    )
    example_table = sa.table(
        "tool_example",
        sa.column("id", sa.Uuid()),
        sa.column("tool_id", sa.Uuid()),
        sa.column("position", sa.Integer()),
        sa.column("code", sa.Text()),
    )
    alternative_table = sa.table(
        "tool_alternative",
        sa.column("tool_id", sa.Uuid()),
        sa.column("alternative_tool_id", sa.Uuid()),
    )

    op.bulk_insert(
        tool_table,
        [
            {
                "id": _tool_id(tool["key"]),
                "key": tool["key"],
                "name": tool["name"],
                "category": tool["category"],
                "documentation_url": tool["documentation_url"],
                "icon": tool["icon"],
            }
            for tool in tools
        ],
    )
    op.bulk_insert(
        translation_table,
        [
            {"tool_id": _tool_id(tool["key"]), "language": "de", "summary": tool["summary_de"]}
            for tool in tools
        ],
    )
    op.bulk_insert(
        hint_table,
        [
            {
                "id": uuid.uuid4(),
                "tool_id": _tool_id(tool["key"]),
                "language": "de",
                "position": position,
                "text": text,
            }
            for tool in tools
            for position, text in enumerate(tool["hints_de"], start=1)
        ],
    )
    op.bulk_insert(
        example_table,
        [
            {
                "id": uuid.uuid4(),
                "tool_id": _tool_id(tool["key"]),
                "position": position,
                "code": code,
            }
            for tool in tools
            for position, code in enumerate(tool["examples"], start=1)
        ],
    )
    # The JSON lists each alternative on both sides; the table stores each pair once.
    pairs = {
        tuple(sorted((_tool_id(tool["key"]), _tool_id(other))))
        for tool in tools
        for other in tool["alternatives"]
        if other in seeded_keys
    }
    op.bulk_insert(
        alternative_table,
        [{"tool_id": first, "alternative_tool_id": second} for first, second in sorted(pairs)],
    )


def downgrade() -> None:
    op.drop_table("tool_alternative")
    op.drop_table("tool_example")
    op.drop_table("tool_hint")
    op.drop_table("tool_translation")
    op.drop_table("tool")
