"""Domain rules of the training progress: plain data, no framework imports."""

from dataclasses import dataclass, replace

# Each game and the number of correct answers in a row (first try) that learn a tool in it.
LEARNED_AFTER: dict[str, int] = {"level0": 2, "clearing": 2}


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
