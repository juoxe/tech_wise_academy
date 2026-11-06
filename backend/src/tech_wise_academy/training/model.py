"""Domain rules of the training progress: plain data, no framework imports."""

from collections.abc import Iterable
from dataclasses import dataclass, replace
from datetime import datetime

# Each game and the number of correct answers in a row (first try) that learn a tool in it.
LEARNED_AFTER: dict[str, int] = {"level0": 2, "clearing": 2}

# The games without saved learning progress. Every round that is played to the end is stored as one
# result: `solved` of `total` tasks. Memory stores the pairs found as `solved` and the moves as
# `total`, so that `solved <= total` holds for every game.
ROUND_GAMES: tuple[str, ...] = ("sql", "code", "memory")


@dataclass(frozen=True)
class RoundResult:
    game: str
    difficulty: int
    solved: int
    total: int
    played_at: datetime


@dataclass(frozen=True)
class ResultSummary:
    """The results of one player in one game and difficulty."""

    game: str
    difficulty: int
    rounds: int
    best: RoundResult
    last: RoundResult


def summarize_results(results: Iterable[RoundResult]) -> tuple[ResultSummary, ...]:
    """Per game and difficulty: the number of rounds, the best and the latest result.

    The best result has the highest share of `solved` in `total`; of equal ones the later wins.
    """
    groups: dict[tuple[str, int], list[RoundResult]] = {}
    for result in results:
        groups.setdefault((result.game, result.difficulty), []).append(result)
    summaries = []
    for game, difficulty in sorted(groups):
        rounds = groups[(game, difficulty)]
        best = max(rounds, key=lambda r: (r.solved / r.total, r.played_at))
        last = max(rounds, key=lambda r: r.played_at)
        summaries.append(ResultSummary(game, difficulty, len(rounds), best, last))
    return tuple(summaries)


@dataclass(frozen=True)
class Progress:
    tool_key: str
    correct_in_a_row: int = 0
    learned: bool = False
    correct_total: int = 0
    wrong_total: int = 0


def apply_answer(progress: Progress, correct: bool, learned_after: int) -> Progress:
    """A correct answer counts up the row, a wrong one resets it. Learned stays learned."""
    if correct:
        in_a_row = progress.correct_in_a_row + 1
        return replace(
            progress,
            correct_in_a_row=in_a_row,
            learned=progress.learned or in_a_row >= learned_after,
            correct_total=progress.correct_total + 1,
        )
    return replace(
        progress,
        correct_in_a_row=0,
        wrong_total=progress.wrong_total + 1,
    )
