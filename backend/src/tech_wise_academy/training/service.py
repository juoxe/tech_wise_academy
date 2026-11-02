"""Use cases of the training: record an answer, read and reset the progress of a player."""

import uuid

from tech_wise_academy.training.model import LEARNED_AFTER, Progress, apply_answer
from tech_wise_academy.training.repository import TrainingRepository


class TrainingService:
    def __init__(self, repository: TrainingRepository) -> None:
        self._repository = repository

    async def record_answer(
        self,
        profile_id: uuid.UUID,
        game: str,
        tool_key: str,
        correct: bool,
    ) -> Progress:
        return await self._repository.update_progress(
            profile_id,
            game,
            tool_key,
            lambda progress: apply_answer(progress, correct, LEARNED_AFTER[game]),
        )

    async def list_progress(self, profile_id: uuid.UUID, game: str) -> tuple[Progress, ...]:
        return await self._repository.list_progress(profile_id, game)

    async def reset_progress(self, profile_id: uuid.UUID, game: str) -> None:
        """Deletes the progress of the player in one game; other games and players stay."""
        await self._repository.reset_progress(profile_id, game)
