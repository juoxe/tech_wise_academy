"""Database access of the training progress: one row per player, game and tool."""

import uuid
from collections.abc import Callable

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncEngine

from tech_wise_academy.training.model import Progress

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
