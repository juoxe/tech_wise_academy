"""Database access of the training progress: one row per player, game and tool."""

import uuid
from collections.abc import Callable

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncEngine

from tech_wise_academy.training.model import Progress, RoundResult

metadata = sa.MetaData()

learning_progress_table = sa.Table(
    "learning_progress",
    metadata,
    sa.Column("profile_id", sa.Uuid, primary_key=True),
    sa.Column("game", sa.Text, primary_key=True),
    sa.Column("tool_key", sa.Text, primary_key=True),
    sa.Column("correct_in_a_row", sa.Integer, nullable=False),
    sa.Column("learned", sa.Boolean, nullable=False),
    sa.Column("correct_total", sa.Integer, nullable=False),
    sa.Column("wrong_total", sa.Integer, nullable=False),
)

round_results_table = sa.Table(
    "round_results",
    metadata,
    sa.Column("id", sa.Uuid, primary_key=True),
    sa.Column("profile_id", sa.Uuid, nullable=False),
    sa.Column("game", sa.Text, nullable=False),
    sa.Column("difficulty", sa.Integer, nullable=False),
    sa.Column("solved", sa.Integer, nullable=False),
    sa.Column("total", sa.Integer, nullable=False),
    sa.Column(
        "played_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    ),
)

tool_priority_table = sa.Table(
    "tool_priority",
    metadata,
    sa.Column("profile_id", sa.Uuid, primary_key=True),
    sa.Column("tool_key", sa.Text, primary_key=True),
    sa.Column("score", sa.Integer, nullable=False),
)

KEY_COLUMNS = ("profile_id", "game", "tool_key")


def _from_row(row: sa.RowMapping) -> Progress:
    return Progress(
        tool_key=row["tool_key"],
        correct_in_a_row=row["correct_in_a_row"],
        learned=row["learned"],
        correct_total=row["correct_total"],
        wrong_total=row["wrong_total"],
    )


class TrainingRepository:
    """Loads and saves the progress of one player in one game."""

    def __init__(self, engine: AsyncEngine) -> None:
        self._engine = engine

    async def list_progress(self, profile_id: uuid.UUID, game: str) -> tuple[Progress, ...]:
        statement = (
            sa.select(learning_progress_table)
            .where(
                learning_progress_table.c.profile_id == profile_id,
                learning_progress_table.c.game == game,
            )
            .order_by(learning_progress_table.c.tool_key)
        )
        async with self._engine.connect() as connection:
            rows = (await connection.execute(statement)).mappings().all()
        return tuple(_from_row(row) for row in rows)

    async def reset_progress(self, profile_id: uuid.UUID, game: str) -> None:
        """Deletes all saved progress of one player in one game."""
        statement = sa.delete(learning_progress_table).where(
            learning_progress_table.c.profile_id == profile_id,
            learning_progress_table.c.game == game,
        )
        async with self._engine.begin() as connection:
            await connection.execute(statement)

    async def add_result(
        self,
        profile_id: uuid.UUID,
        game: str,
        difficulty: int,
        solved: int,
        total: int,
    ) -> None:
        """Stores the result of one finished round; the time is set by the database."""
        statement = sa.insert(round_results_table).values(
            id=uuid.uuid4(),
            profile_id=profile_id,
            game=game,
            difficulty=difficulty,
            solved=solved,
            total=total,
        )
        async with self._engine.begin() as connection:
            await connection.execute(statement)

    async def list_results(self, profile_id: uuid.UUID) -> tuple[RoundResult, ...]:
        """All stored results of one player, oldest first."""
        statement = (
            sa.select(round_results_table)
            .where(round_results_table.c.profile_id == profile_id)
            .order_by(round_results_table.c.played_at)
        )
        async with self._engine.connect() as connection:
            rows = (await connection.execute(statement)).mappings().all()
        return tuple(
            RoundResult(
                game=row["game"],
                difficulty=row["difficulty"],
                solved=row["solved"],
                total=row["total"],
                played_at=row["played_at"],
            )
            for row in rows
        )

    async def update_progress(
        self,
        profile_id: uuid.UUID,
        game: str,
        tool_key: str,
        change: Callable[[Progress], Progress],
    ) -> Progress:
        """Reads the row, applies the change and writes it back in one transaction."""
        where = [
            learning_progress_table.c.profile_id == profile_id,
            learning_progress_table.c.game == game,
            learning_progress_table.c.tool_key == tool_key,
        ]
        async with self._engine.begin() as connection:
            row = (
                (
                    await connection.execute(
                        sa.select(learning_progress_table).where(*where).with_for_update()
                    )
                )
                .mappings()
                .first()
            )
            current = _from_row(row) if row else Progress(tool_key=tool_key)
            updated = change(current)
            values = {
                "profile_id": profile_id,
                "game": game,
                "tool_key": tool_key,
                "correct_in_a_row": updated.correct_in_a_row,
                "learned": updated.learned,
                "correct_total": updated.correct_total,
                "wrong_total": updated.wrong_total,
            }
            statement = insert(learning_progress_table).values(values)
            statement = statement.on_conflict_do_update(
                index_elements=list(KEY_COLUMNS),
                set_={key: value for key, value in values.items() if key not in KEY_COLUMNS},
            )
            await connection.execute(statement)
        return updated

    async def list_scores(self, profile_id: uuid.UUID) -> dict[str, int]:
        """The stored scores of a player; a tool that is not in the result has no score."""
        statement = sa.select(tool_priority_table.c.tool_key, tool_priority_table.c.score).where(
            tool_priority_table.c.profile_id == profile_id
        )
        async with self._engine.connect() as connection:
            rows = (await connection.execute(statement)).all()
        return {tool_key: score for tool_key, score in rows}

    async def set_scores(
        self, profile_id: uuid.UUID, tool_keys: list[str], score: int | None
    ) -> None:
        """Sets one score for several tools; `None` removes their scores (not set)."""
        async with self._engine.begin() as connection:
            if score is None:
                await connection.execute(
                    sa.delete(tool_priority_table).where(
                        tool_priority_table.c.profile_id == profile_id,
                        tool_priority_table.c.tool_key.in_(tool_keys),
                    )
                )
                return
            statement = insert(tool_priority_table).values(
                [
                    {"profile_id": profile_id, "tool_key": tool_key, "score": score}
                    for tool_key in tool_keys
                ]
            )
            await connection.execute(
                statement.on_conflict_do_update(
                    index_elements=["profile_id", "tool_key"],
                    set_={"score": statement.excluded.score},
                )
            )

    async def reset_scores(self, profile_id: uuid.UUID) -> None:
        async with self._engine.begin() as connection:
            await connection.execute(
                sa.delete(tool_priority_table).where(tool_priority_table.c.profile_id == profile_id)
            )
