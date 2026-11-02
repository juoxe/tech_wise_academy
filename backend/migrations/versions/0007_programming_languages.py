"""Programming languages: a second set of cards, sorted by paradigm instead of by area.

The category check gets the five paradigms, TypeScript moves to the languages, and the
languages that are not in the database yet are added.

Revision ID: 0007
Revises: 0006
Create Date: 2026-11-01
"""

import json
import uuid
from collections.abc import Sequence
from importlib import resources

import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: str | None = "0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

AREAS = ("DEVOPS", "BACKEND", "FRONTEND", "SECURITY", "AI_DATA")
PARADIGMS = ("OBJECT_ORIENTED", "FUNCTIONAL", "PROCEDURAL", "DECLARATIVE", "MULTI_PARADIGM")
SEED_NAMESPACE = uuid.UUID("6f1c2b1e-0c0a-4e8e-9c4b-7d1f3a2b5e10")


def _tool_id(key: str) -> uuid.UUID:
    """Same deterministic ids as in 0001 and 0002."""
    return uuid.uuid5(SEED_NAMESPACE, key)


def _seed_tools() -> list[dict]:
    text = resources.files("tech_wise_academy.learning_content").joinpath("seed_tools.json")
    return json.loads(text.read_text(encoding="utf-8"))["tools"]


def _check(categories: Sequence[str]) -> str:
    values = ", ".join(f"'{category}'" for category in categories)
    return f"category IN ({values})"


def upgrade() -> None:
    op.drop_constraint("tool_category_values", "tool", type_="check")
    op.create_check_constraint("tool_category_values", "tool", _check(AREAS + PARADIGMS))
    op.get_bind().execute(
        sa.text("UPDATE tool SET category = 'MULTI_PARADIGM' WHERE key = 'typescript'")
    )

    existing = {row[0] for row in op.get_bind().execute(sa.text("SELECT key FROM tool"))}
    tools = [tool for tool in _seed_tools() if tool["key"] not in existing]
    if not tools:
        return
    new_keys = {tool["key"] for tool in tools}

    op.bulk_insert(
        sa.table(
            "tool",
            sa.column("id", sa.Uuid()),
            sa.column("key", sa.Text()),
            sa.column("name", sa.Text()),
            sa.column("category", sa.Text()),
            sa.column("level", sa.Integer()),
            sa.column("documentation_url", sa.Text()),
            sa.column("icon", sa.Text()),
        ),
        [
            {
                "id": _tool_id(tool["key"]),
                "key": tool["key"],
                "name": tool["name"],
                "category": tool["category"],
                "level": tool["level"],
                "documentation_url": tool["documentation_url"],
                "icon": tool["icon"],
            }
            for tool in tools
        ],
    )
    op.bulk_insert(
        sa.table(
            "tool_translation",
            sa.column("tool_id", sa.Uuid()),
            sa.column("language", sa.Text()),
            sa.column("summary", sa.Text()),
        ),
        [
            {"tool_id": _tool_id(tool["key"]), "language": "de", "summary": tool["summary_de"]}
            for tool in tools
        ],
    )
    op.bulk_insert(
        sa.table(
            "tool_hint",
            sa.column("id", sa.Uuid()),
            sa.column("tool_id", sa.Uuid()),
            sa.column("language", sa.Text()),
            sa.column("position", sa.Integer()),
            sa.column("text", sa.Text()),
        ),
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
    examples = [
        {
            "id": uuid.uuid4(),
            "tool_id": _tool_id(tool["key"]),
            "position": position,
            "code": code,
        }
        for tool in tools
        for position, code in enumerate(tool["examples"], start=1)
    ]
    if examples:
        op.bulk_insert(
            sa.table(
                "tool_example",
                sa.column("id", sa.Uuid()),
                sa.column("tool_id", sa.Uuid()),
                sa.column("position", sa.Integer()),
                sa.column("code", sa.Text()),
            ),
            examples,
        )
    # Only pairs with at least one new tool; pairs between old tools are already stored.
    pairs = {
        tuple(sorted((_tool_id(tool["key"]), _tool_id(other))))
        for tool in tools
        for other in tool["alternatives"]
        if tool["key"] in new_keys
    }
    if pairs:
        op.bulk_insert(
            sa.table(
                "tool_alternative",
                sa.column("tool_id", sa.Uuid()),
                sa.column("alternative_tool_id", sa.Uuid()),
            ),
            [{"tool_id": first, "alternative_tool_id": second} for first, second in sorted(pairs)],
        )


def downgrade() -> None:
    # Not reversible: the language tools and their category values stay.
    pass
