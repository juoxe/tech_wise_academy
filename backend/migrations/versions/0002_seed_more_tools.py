"""Seed the tools that are not in the database yet (all tools of the Tech Tool Trainer).

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-27
"""

import json
import uuid
from collections.abc import Sequence
from importlib import resources

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

AREAS = ("DEVOPS", "BACKEND", "FRONTEND", "SECURITY", "AI_DATA")
SEED_NAMESPACE = uuid.UUID("6f1c2b1e-0c0a-4e8e-9c4b-7d1f3a2b5e10")


def _tool_id(key: str) -> uuid.UUID:
    """Same deterministic ids as in 0001, so the alternatives of both migrations match."""
    return uuid.uuid5(SEED_NAMESPACE, key)


def _seed_tools() -> list[dict]:
    text = resources.files("tech_wise_academy.learning_content").joinpath("seed_tools.json")
    return json.loads(text.read_text(encoding="utf-8"))["tools"]


def upgrade() -> None:
    existing = {row[0] for row in op.get_bind().execute(sa.text("SELECT key FROM tool"))}
    tools = [
        tool for tool in _seed_tools() if tool["key"] not in existing and tool["category"] in AREAS
    ]
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
            sa.column("documentation_url", sa.Text()),
            sa.column("icon", sa.Text()),
        ),
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
    op.bulk_insert(
        sa.table(
            "tool_example",
            sa.column("id", sa.Uuid()),
            sa.column("tool_id", sa.Uuid()),
            sa.column("position", sa.Integer()),
            sa.column("code", sa.Text()),
        ),
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
    # Only pairs with at least one new tool; pairs between old tools are already stored.
    pairs = {
        tuple(sorted((_tool_id(tool["key"]), _tool_id(other))))
        for tool in tools
        for other in tool["alternatives"]
        if tool["key"] in new_keys
    }
    op.bulk_insert(
        sa.table(
            "tool_alternative",
            sa.column("tool_id", sa.Uuid()),
            sa.column("alternative_tool_id", sa.Uuid()),
        ),
        [{"tool_id": first, "alternative_tool_id": second} for first, second in sorted(pairs)],
    )


def downgrade() -> None:
    # The tools are removed together with 0001.
    pass
