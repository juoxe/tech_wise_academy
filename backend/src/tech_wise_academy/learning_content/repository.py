"""Database access: tables and loading of tools, hints, examples and alternative pairs."""

import dataclasses
import uuid

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine

from tech_wise_academy.learning_content.model import (
    DEFAULT_LANGUAGE,
    Category,
    KeyConcept,
    Paradigm,
    Tool,
    ToolContent,
    ToolDraft,
)

metadata = sa.MetaData()

tool_table = sa.Table(
    "tool",
    metadata,
    sa.Column("id", sa.Uuid, primary_key=True),
    sa.Column("key", sa.Text, nullable=False, unique=True),
    sa.Column("name", sa.Text, nullable=False),
    sa.Column("category", sa.Text, nullable=False),
    sa.Column("default_priority", sa.Integer, nullable=False),
    sa.Column("paradigm", sa.Text),
    sa.Column("documentation_url", sa.Text, nullable=False),
    sa.Column("icon", sa.Text),
    sa.Column("deleted_at", sa.DateTime(timezone=True)),
)

tool_translation_table = sa.Table(
    "tool_translation",
    metadata,
    sa.Column("tool_id", sa.Uuid, sa.ForeignKey("tool.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("language", sa.Text, primary_key=True),
    sa.Column("summary", sa.Text, nullable=False),
    sa.Column("content", JSONB),
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


def _content_of(data: dict) -> ToolContent:
    """Reads the stored JSON of one language; the structure is checked by the seed tests."""
    return ToolContent(
        overview=data["overview"],
        use_cases=tuple(data["use_cases"]),
        key_concepts=tuple(
            KeyConcept(term=item["term"], explanation=item["explanation"])
            for item in data["key_concepts"]
        ),
        when_to_use=data["when_to_use"],
        when_not_to_use=data["when_not_to_use"],
        good_to_know=tuple(data["good_to_know"]),
    )


class ToolRepository:
    """Loads the learning content from the database."""

    def __init__(self, engine: AsyncEngine) -> None:
        self._engine = engine

    async def load_tools(self) -> tuple[Tool, ...]:
        async with self._engine.connect() as connection:
            tool_rows = (
                (
                    await connection.execute(
                        sa.select(tool_table).where(tool_table.c.deleted_at.is_(None))
                    )
                )
                .mappings()
                .all()
            )
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
        contents: dict[uuid.UUID, dict[str, ToolContent]] = {}
        for row in translation_rows:
            summaries.setdefault(row["tool_id"], {})[row["language"]] = row["summary"]
            if row["content"] is not None:
                contents.setdefault(row["tool_id"], {})[row["language"]] = _content_of(
                    row["content"]
                )

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
                default_priority=row["default_priority"],
                documentation_url=row["documentation_url"],
                icon=row["icon"],
                summaries=summaries.get(row["id"], {}),
                hints={
                    language: tuple(texts) for language, texts in hints.get(row["id"], {}).items()
                },
                examples=tuple(examples.get(row["id"], [])),
                contents=contents.get(row["id"], {}),
                paradigm=None if row["paradigm"] is None else Paradigm(row["paradigm"]),
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
            .where(first.c.deleted_at.is_(None), second.c.deleted_at.is_(None))
        )
        async with self._engine.connect() as connection:
            rows = (await connection.execute(query)).all()
        return tuple((left, right) for left, right in rows)

    async def key_exists(self, key: str) -> bool:
        """True also for a deleted tool: its key stays taken, because other data refers to it."""
        async with self._engine.connect() as connection:
            row = await connection.execute(
                sa.select(tool_table.c.id).where(tool_table.c.key == key)
            )
            return row.first() is not None

    async def create_tool(self, draft: ToolDraft) -> None:
        tool_id = uuid.uuid4()
        async with self._engine.begin() as connection:
            await connection.execute(
                sa.insert(tool_table).values(
                    id=tool_id,
                    key=draft.key,
                    name=draft.name,
                    category=draft.category.value,
                    paradigm=None if draft.paradigm is None else draft.paradigm.value,
                    default_priority=draft.default_priority,
                    documentation_url=draft.documentation_url,
                    icon=draft.icon,
                )
            )
            await _write_texts(connection, tool_id, draft, replace=False)
            await _write_alternatives(connection, tool_id, draft.alternatives)

    async def update_tool(self, draft: ToolDraft) -> bool:
        """Replaces all data of the tool. Returns False if there is no such (live) tool."""
        async with self._engine.begin() as connection:
            tool_id = await _live_tool_id(connection, draft.key)
            if tool_id is None:
                return False
            await connection.execute(
                sa.update(tool_table)
                .where(tool_table.c.id == tool_id)
                .values(
                    name=draft.name,
                    category=draft.category.value,
                    paradigm=None if draft.paradigm is None else draft.paradigm.value,
                    default_priority=draft.default_priority,
                    documentation_url=draft.documentation_url,
                    icon=draft.icon,
                )
            )
            await _write_texts(connection, tool_id, draft, replace=True)
            await connection.execute(
                sa.delete(tool_alternative_table).where(
                    sa.or_(
                        tool_alternative_table.c.tool_id == tool_id,
                        tool_alternative_table.c.alternative_tool_id == tool_id,
                    )
                )
            )
            await _write_alternatives(connection, tool_id, draft.alternatives)
            return True

    async def delete_tool(self, key: str) -> bool:
        """Soft delete: marks the tool as deleted. Returns False if there is no such (live) tool."""
        async with self._engine.begin() as connection:
            result = await connection.execute(
                sa.update(tool_table)
                .where(tool_table.c.key == key, tool_table.c.deleted_at.is_(None))
                .values(deleted_at=sa.func.now())
            )
            return result.rowcount > 0


async def _live_tool_id(connection: AsyncConnection, key: str) -> uuid.UUID | None:
    row = await connection.execute(
        sa.select(tool_table.c.id).where(tool_table.c.key == key, tool_table.c.deleted_at.is_(None))
    )
    found = row.first()
    return None if found is None else found[0]


async def _write_texts(
    connection: AsyncConnection, tool_id: uuid.UUID, draft: ToolDraft, *, replace: bool
) -> None:
    if replace:
        for table in (tool_translation_table, tool_hint_table, tool_example_table):
            await connection.execute(sa.delete(table).where(table.c.tool_id == tool_id))
    content = None if draft.content is None else dataclasses.asdict(draft.content)
    await connection.execute(
        sa.insert(tool_translation_table).values(
            tool_id=tool_id, language=DEFAULT_LANGUAGE, summary=draft.summary, content=content
        )
    )
    if draft.hints:
        await connection.execute(
            sa.insert(tool_hint_table),
            [
                {
                    "id": uuid.uuid4(),
                    "tool_id": tool_id,
                    "language": DEFAULT_LANGUAGE,
                    "position": position,
                    "text": text,
                }
                for position, text in enumerate(draft.hints, start=1)
            ],
        )
    if draft.examples:
        await connection.execute(
            sa.insert(tool_example_table),
            [
                {"id": uuid.uuid4(), "tool_id": tool_id, "position": position, "code": code}
                for position, code in enumerate(draft.examples, start=1)
            ],
        )


async def _write_alternatives(
    connection: AsyncConnection, tool_id: uuid.UUID, alternative_keys: tuple[str, ...]
) -> None:
    """Each pair is stored once, from the side of the tool that is saved."""
    if not alternative_keys:
        return
    rows = await connection.execute(
        sa.select(tool_table.c.id).where(
            tool_table.c.key.in_(alternative_keys), tool_table.c.deleted_at.is_(None)
        )
    )
    await connection.execute(
        sa.insert(tool_alternative_table),
        [ordered_pair(tool_id, row[0]) for row in rows],
    )


def ordered_pair(first: uuid.UUID, second: uuid.UUID) -> dict[str, uuid.UUID]:
    """A pair is stored once, the smaller ID first (check `tool_alternative_stored_once`)."""
    low, high = sorted((first, second))
    return {"tool_id": low, "alternative_tool_id": high}
