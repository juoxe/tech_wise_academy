"""Database access: tables and loading of tools, hints, examples and alternative pairs."""

import uuid

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncEngine

from tech_wise_academy.learning_content.model import Category, Tool

metadata = sa.MetaData()

tool_table = sa.Table(
    "tool",
    metadata,
    sa.Column("id", sa.Uuid, primary_key=True),
    sa.Column("key", sa.Text, nullable=False, unique=True),
    sa.Column("name", sa.Text, nullable=False),
    sa.Column("category", sa.Text, nullable=False),
    sa.Column("level", sa.Integer, nullable=False),
    sa.Column("documentation_url", sa.Text, nullable=False),
    sa.Column("icon", sa.Text),
)

tool_translation_table = sa.Table(
    "tool_translation",
    metadata,
    sa.Column("tool_id", sa.Uuid, sa.ForeignKey("tool.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("language", sa.Text, primary_key=True),
    sa.Column("summary", sa.Text, nullable=False),
)

tool_hint_table = sa.Table(
    "tool_hint",
    metadata,
    sa.Column("id", sa.Uuid, primary_key=True),
    sa.Column("tool_id", sa.Uuid, sa.ForeignKey("tool.id", ondelete="CASCADE"), nullable=False),
    sa.Column("language", sa.Text, nullable=False),
    sa.Column("position", sa.Integer, nullable=False),
    sa.Column("text", sa.Text, nullable=False),
)

tool_example_table = sa.Table(
    "tool_example",
    metadata,
    sa.Column("id", sa.Uuid, primary_key=True),
    sa.Column("tool_id", sa.Uuid, sa.ForeignKey("tool.id", ondelete="CASCADE"), nullable=False),
    sa.Column("position", sa.Integer, nullable=False),
    sa.Column("code", sa.Text, nullable=False),
)

tool_alternative_table = sa.Table(
    "tool_alternative",
    metadata,
    sa.Column("tool_id", sa.Uuid, sa.ForeignKey("tool.id", ondelete="CASCADE"), primary_key=True),
    sa.Column(
        "alternative_tool_id",
        sa.Uuid,
        sa.ForeignKey("tool.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class ToolRepository:
    """Loads the learning content from the database."""

    def __init__(self, engine: AsyncEngine) -> None:
        self._engine = engine

    async def load_tools(self) -> tuple[Tool, ...]:
        async with self._engine.connect() as connection:
            tool_rows = (await connection.execute(sa.select(tool_table))).mappings().all()
            translation_rows = (
                (await connection.execute(sa.select(tool_translation_table))).mappings().all()
            )
            hint_rows = (
                (
                    await connection.execute(
                        sa.select(tool_hint_table).order_by(tool_hint_table.c.position)
                    )
                )
                .mappings()
                .all()
            )
            example_rows = (
                (
                    await connection.execute(
                        sa.select(tool_example_table).order_by(tool_example_table.c.position)
                    )
                )
                .mappings()
                .all()
            )

        summaries: dict[uuid.UUID, dict[str, str]] = {}
        for row in translation_rows:
            summaries.setdefault(row["tool_id"], {})[row["language"]] = row["summary"]

        hints: dict[uuid.UUID, dict[str, list[str]]] = {}
        for row in hint_rows:
            hints.setdefault(row["tool_id"], {}).setdefault(row["language"], []).append(row["text"])

        examples: dict[uuid.UUID, list[str]] = {}
        for row in example_rows:
            examples.setdefault(row["tool_id"], []).append(row["code"])

        return tuple(
            Tool(
                key=row["key"],
                name=row["name"],
                category=Category(row["category"]),
                level=row["level"],
                documentation_url=row["documentation_url"],
                icon=row["icon"],
                summaries=summaries.get(row["id"], {}),
                hints={
                    language: tuple(texts) for language, texts in hints.get(row["id"], {}).items()
                },
                examples=tuple(examples.get(row["id"], [])),
            )
            for row in tool_rows
        )

    async def load_alternative_pairs(self) -> tuple[tuple[str, str], ...]:
        """Each pair is stored once; the keys of both tools are returned."""
        first = tool_table.alias("first")
        second = tool_table.alias("second")
        query = (
            sa.select(first.c.key, second.c.key)
            .select_from(tool_alternative_table)
            .join(first, first.c.id == tool_alternative_table.c.tool_id)
            .join(second, second.c.id == tool_alternative_table.c.alternative_tool_id)
        )
        async with self._engine.connect() as connection:
            rows = (await connection.execute(query)).all()
        return tuple((left, right) for left, right in rows)
