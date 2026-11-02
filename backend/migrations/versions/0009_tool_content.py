"""Learning content: structured content per tool and language (overview, use cases, key concepts).

The content is read from the seed file (`content_de`). To load changed content into a development
database, run `alembic downgrade 0008` and `alembic upgrade head` again.

Revision ID: 0009
Revises: 0008
Create Date: 2026-11-02
"""

import json
from collections.abc import Sequence
from importlib import resources

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "0009"
down_revision: str | None = "0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _seed_contents() -> list[dict]:
    text = resources.files("tech_wise_academy.learning_content").joinpath("seed_tools.json")
    tools = json.loads(text.read_text(encoding="utf-8"))["tools"]
    return [
        {"key": tool["key"], "content": json.dumps(tool["content_de"], ensure_ascii=False)}
        for tool in tools
        if "content_de" in tool
    ]


def upgrade() -> None:
    op.add_column("tool_translation", sa.Column("content", JSONB(), nullable=True))
    contents = _seed_contents()
    if contents:
        op.get_bind().execute(
            sa.text(
                "UPDATE tool_translation SET content = CAST(:content AS jsonb) "
                "WHERE language = 'de' AND tool_id = (SELECT id FROM tool WHERE key = :key)"
            ),
            contents,
        )


def downgrade() -> None:
    op.drop_column("tool_translation", "content")
