"""Database access of the interview sets: embeddings, sets and their similarity values."""

import uuid
from collections.abc import Callable, Iterable
from typing import Any

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine
from sqlalchemy.types import UserDefinedType

from tech_wise_academy.interview.model import (
    Card,
    Chunk,
    InterviewSet,
    InterviewSetSummary,
    RankedTool,
    ToolScore,
    Vector,
)


class VectorType(UserDefinedType[Vector]):
    """The pgvector type `vector`, without a fixed dimension (see migration 0008)."""

    cache_ok = True

    def get_col_spec(self, **kw: object) -> str:
        return "vector"

    def bind_processor(self, dialect: sa.Dialect) -> Any:
        return lambda value: "[" + ",".join(repr(number) for number in value or ()) + "]"

    def bind_expression(self, bindvalue: sa.BindParameter) -> sa.Cast:
        return sa.cast(bindvalue, self)


metadata = sa.MetaData()

tool_embedding_table = sa.Table(
    "tool_embedding",
    metadata,
    sa.Column("tool_key", sa.Text, primary_key=True),
    sa.Column("model", sa.Text, primary_key=True),
    sa.Column("text_hash", sa.Text, nullable=False),
    sa.Column("embedding", VectorType, nullable=False),
)

interview_set_table = sa.Table(
    "interview_set",
    metadata,
    sa.Column("id", sa.Uuid, primary_key=True),
    sa.Column("profile_id", sa.Uuid, nullable=False),
    sa.Column("title", sa.Text, nullable=False),
    sa.Column("job_ad", sa.Text, nullable=False),
    sa.Column("model", sa.Text, nullable=False),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
)

interview_set_chunk_table = sa.Table(
    "interview_set_chunk",
    metadata,
    sa.Column("set_id", sa.Uuid, sa.ForeignKey("interview_set.id"), primary_key=True),
    sa.Column("position", sa.Integer, primary_key=True),
    sa.Column("text", sa.Text, nullable=False),
    sa.Column("embedding", VectorType, nullable=False),
)

interview_set_tool_table = sa.Table(
    "interview_set_tool",
    metadata,
    sa.Column("set_id", sa.Uuid, sa.ForeignKey("interview_set.id"), primary_key=True),
    sa.Column("tool_key", sa.Text, primary_key=True),
    sa.Column("similarity", sa.Double, nullable=False),
    sa.Column("chunk_position", sa.Integer, nullable=False),
    sa.Column("mentioned", sa.Boolean, nullable=False),
    sa.Column("rank", sa.Integer),
)


class InterviewRepository:
    """Stores embeddings and sets. The similarity is computed by pgvector, not in Python."""

    def __init__(self, engine: AsyncEngine) -> None:
        self._engine = engine

    async def load_text_hashes(self, model: str) -> dict[str, str]:
        statement = sa.select(
            tool_embedding_table.c.tool_key, tool_embedding_table.c.text_hash
        ).where(tool_embedding_table.c.model == model)
        async with self._engine.connect() as connection:
            rows = (await connection.execute(statement)).all()
        return {key: text_hash for key, text_hash in rows}

    async def save_tool_embeddings(
        self,
        model: str,
        embeddings: Iterable[tuple[str, str, Vector]],
        removed_keys: Iterable[str],
    ) -> None:
        """Replaces the embeddings of the given tools and drops those of removed tools."""
        rows = [
            {"tool_key": key, "model": model, "text_hash": text_hash, "embedding": vector}
            for key, text_hash, vector in embeddings
        ]
        stale = {row["tool_key"] for row in rows} | set(removed_keys)
        async with self._engine.begin() as connection:
            await connection.execute(
                sa.delete(tool_embedding_table).where(
                    tool_embedding_table.c.model == model,
                    tool_embedding_table.c.tool_key.in_(stale),
                )
            )
            if rows:
                await connection.execute(sa.insert(tool_embedding_table), rows)

    async def create_set(
        self,
        interview_set: InterviewSetSummary,
        profile_id: uuid.UUID,
        job_ad: str,
        model: str,
        chunks: tuple[Chunk, ...],
        vectors: list[Vector],
        rank_scores: Callable[[tuple[ToolScore, ...]], tuple[RankedTool, ...]],
    ) -> None:
        """Stores the set in one transaction, with the similarity of every tool to the ad."""
        async with self._engine.begin() as connection:
            await connection.execute(
                sa.insert(interview_set_table).values(
                    id=interview_set.id,
                    profile_id=profile_id,
                    title=interview_set.title,
                    job_ad=job_ad,
                    model=model,
                    created_at=interview_set.created_at,
                )
            )
            await connection.execute(
                sa.insert(interview_set_chunk_table),
                [
                    {
                        "set_id": interview_set.id,
                        "position": chunk.position,
                        "text": chunk.text,
                        "embedding": vector,
                    }
                    for chunk, vector in zip(chunks, vectors, strict=True)
                ],
            )
            ranked = rank_scores(await _score_tools(connection, interview_set.id, model))
            await connection.execute(
                sa.insert(interview_set_tool_table),
                [
                    {
                        "set_id": interview_set.id,
                        "tool_key": tool.tool_key,
                        "similarity": tool.similarity,
                        "chunk_position": tool.chunk_position,
                        "mentioned": tool.mentioned,
                        "rank": tool.rank,
                    }
                    for tool in ranked
                ],
            )

    async def list_sets(self, profile_id: uuid.UUID) -> tuple[InterviewSetSummary, ...]:
        statement = (
            sa.select(
                interview_set_table.c.id,
                interview_set_table.c.title,
                interview_set_table.c.created_at,
                sa.func.count(interview_set_tool_table.c.rank).label("card_count"),
            )
            .join(
                interview_set_tool_table,
                interview_set_tool_table.c.set_id == interview_set_table.c.id,
            )
            .where(interview_set_table.c.profile_id == profile_id)
            .group_by(interview_set_table.c.id)
            .order_by(interview_set_table.c.created_at.desc())
        )
        async with self._engine.connect() as connection:
            rows = (await connection.execute(statement)).mappings().all()
        return tuple(
            InterviewSetSummary(
                id=row["id"],
                title=row["title"],
                created_at=row["created_at"],
                card_count=row["card_count"],
            )
            for row in rows
        )

    async def load_set(self, profile_id: uuid.UUID, set_id: uuid.UUID) -> InterviewSet | None:
        """A set is only returned to the profile that created it."""
        tool = interview_set_tool_table
        chunk = interview_set_chunk_table
        cards_statement = (
            sa.select(tool.c.tool_key, tool.c.similarity, tool.c.mentioned, chunk.c.text)
            .join(
                chunk,
                sa.and_(chunk.c.set_id == tool.c.set_id, chunk.c.position == tool.c.chunk_position),
            )
            .where(tool.c.set_id == set_id, tool.c.rank.is_not(None))
            .order_by(tool.c.rank)
        )
        async with self._engine.connect() as connection:
            row = (
                (
                    await connection.execute(
                        sa.select(interview_set_table).where(
                            interview_set_table.c.id == set_id,
                            interview_set_table.c.profile_id == profile_id,
                        )
                    )
                )
                .mappings()
                .first()
            )
            if row is None:
                return None
            card_rows = (await connection.execute(cards_statement)).mappings().all()
        cards = tuple(
            Card(
                tool_key=card["tool_key"],
                similarity=card["similarity"],
                mentioned=card["mentioned"],
                evidence=card["text"],
            )
            for card in card_rows
        )
        return InterviewSet(
            id=row["id"],
            title=row["title"],
            created_at=row["created_at"],
            model=row["model"],
            cards=cards,
        )

    async def delete_set(self, profile_id: uuid.UUID, set_id: uuid.UUID) -> bool:
        """The chunks and similarity values go with the set (ON DELETE CASCADE)."""
        statement = sa.delete(interview_set_table).where(
            interview_set_table.c.id == set_id,
            interview_set_table.c.profile_id == profile_id,
        )
        async with self._engine.begin() as connection:
            result = await connection.execute(statement)
        return result.rowcount > 0


async def _score_tools(
    connection: AsyncConnection, set_id: uuid.UUID, model: str
) -> tuple[ToolScore, ...]:
    """For each tool the closest chunk of the ad, by cosine distance (`<=>`) in pgvector."""
    rows = await connection.execute(
        sa.text(
            """
            SELECT DISTINCT ON (tool.tool_key)
                tool.tool_key,
                1 - (tool.embedding <=> chunk.embedding) AS similarity,
                chunk.position
            FROM tool_embedding AS tool
            JOIN interview_set_chunk AS chunk ON chunk.set_id = :set_id
            WHERE tool.model = :model
            ORDER BY tool.tool_key, tool.embedding <=> chunk.embedding
            """
        ),
        {"set_id": set_id, "model": model},
    )
    return tuple(
        ToolScore(tool_key=key, similarity=similarity, chunk_position=position)
        for key, similarity, position in rows
    )
