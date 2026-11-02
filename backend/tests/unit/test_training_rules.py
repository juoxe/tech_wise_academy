"""Training progress rules: learned after two correct answers, a wrong one resets the row."""

from tech_wise_academy.training.model import LEARNED_AFTER, Progress, apply_answer

TWO = LEARNED_AFTER["level0"]


def test_one_correct_answer_is_not_learned_yet() -> None:
    progress = apply_answer(Progress(tool_key="docker"), correct=True, learned_after=TWO)

    assert progress.correct_in_a_row == 1
    assert not progress.learned
    assert progress.correct_total == 1


def test_two_correct_answers_in_a_row_learn_the_tool() -> None:
    progress = apply_answer(apply_answer(Progress(tool_key="docker"), True, TWO), True, TWO)

    assert progress.learned
    assert progress.correct_in_a_row == 2
    assert progress.correct_total == 2


def test_a_wrong_answer_resets_the_row_but_keeps_the_counts() -> None:
    progress = apply_answer(apply_answer(Progress(tool_key="docker"), True, TWO), False, TWO)

    assert progress.correct_in_a_row == 0
    assert progress.correct_total == 1
    assert progress.wrong_total == 1
    assert not progress.learned


def test_the_clearing_game_learns_after_its_threshold() -> None:
    progress = Progress(tool_key="docker")
    for _ in range(LEARNED_AFTER["clearing"]):
        progress = apply_answer(progress, True, LEARNED_AFTER["clearing"])

    assert progress.learned


def test_learned_stays_learned_after_a_wrong_answer() -> None:
    learned = apply_answer(apply_answer(Progress(tool_key="docker"), True, TWO), True, TWO)

    progress = apply_answer(learned, False, TWO)

    assert progress.learned
    assert progress.wrong_total == 1
