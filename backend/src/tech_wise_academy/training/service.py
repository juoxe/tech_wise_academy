"""Use cases of the training: record an answer, read and reset the progress of a player."""

import uuid

from tech_wise_academy.training.model import (
    LEARNED_AFTER,
    Progress,
    ResultSummary,
    apply_answer,
    is_valid_score,
    summarize_results,
)
from tech_wise_academy.training.repository import TrainingRepository


class InvalidScoreError(ValueError):
    """The score is outside the scale of the importance score."""


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

    async def record_result(
        self,
        profile_id: uuid.UUID,
        game: str,
        difficulty: int,
        solved: int,
        total: int,
    ) -> None:
        """Stores the result of a finished round of a game without saved learning progress."""
        await self._repository.add_result(profile_id, game, difficulty, solved, total)

    async def list_result_summaries(self, profile_id: uuid.UUID) -> tuple[ResultSummary, ...]:
        """The rounds, the best and the latest result per game and difficulty of the player."""
        return summarize_results(await self._repository.list_results(profile_id))

    async def reset_progress(self, profile_id: uuid.UUID, game: str) -> None:
        """Deletes the progress of the player in one game; other games and players stay."""
        await self._repository.reset_progress(profile_id, game)

    async def list_scores(self, profile_id: uuid.UUID) -> dict[str, int]:
        """The scores the player has set; a tool that is not listed has no score."""
        return await self._repository.list_scores(profile_id)

    async def set_scores(
        self, profile_id: uuid.UUID, tool_keys: list[str], score: int | None
    ) -> None:
        """Gives all the tools the same importance score; `None` removes their scores."""
        if not is_valid_score(score):
            raise InvalidScoreError(score)
        await self._repository.set_scores(profile_id, sorted(set(tool_keys)), score)

    async def reset_scores(self, profile_id: uuid.UUID) -> None:
        """All tools of the player go back to "not set"."""
        await self._repository.reset_scores(profile_id)
