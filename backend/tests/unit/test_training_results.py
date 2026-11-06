"""Results of the rounds of the games without saved progress: summary rule and HTTP contract."""

import uuid
from datetime import UTC, datetime

from fastapi.testclient import TestClient

from tech_wise_academy.main import create_app
from tech_wise_academy.training.model import ResultSummary, RoundResult, summarize_results

PROFILE_ID = uuid.uuid4()
HEADERS = {"X-Profile-Id": str(PROFILE_ID)}


def _result(game: str, difficulty: int, solved: int, total: int, minute: int) -> RoundResult:
    return RoundResult(
        game, difficulty, solved, total, datetime(2026, 11, 5, 10, minute, tzinfo=UTC)
    )


def test_the_summary_has_rounds_best_and_last_per_game_and_difficulty() -> None:
    results = [
        _result("sql", 1, 4, 6, minute=1),
        _result("sql", 1, 6, 6, minute=2),
        _result("sql", 1, 3, 6, minute=3),
        _result("sql", 2, 2, 6, minute=4),
        _result("code", 1, 1, 5, minute=5),
    ]

    summaries = summarize_results(results)

    assert [(s.game, s.difficulty, s.rounds) for s in summaries] == [
        ("code", 1, 1),
        ("sql", 1, 3),
        ("sql", 2, 1),
    ]
    sql_kennen = summaries[1]
    assert (sql_kennen.best.solved, sql_kennen.best.total) == (6, 6)
    assert (sql_kennen.last.solved, sql_kennen.last.total) == (3, 6)


def test_of_equal_best_results_the_later_one_counts() -> None:
    results = [_result("memory", 1, 4, 8, minute=1), _result("memory", 1, 4, 8, minute=9)]

    best = summarize_results(results)[0].best

    assert best.played_at.minute == 9


def test_no_results_give_no_summary() -> None:
    assert summarize_results([]) == ()


class FakeService:
    def __init__(self) -> None:
        self.saved: list[tuple[uuid.UUID, str, int, int, int]] = []

    async def record_result(
        self, profile_id: uuid.UUID, game: str, difficulty: int, solved: int, total: int
    ) -> None:
        self.saved.append((profile_id, game, difficulty, solved, total))

    async def list_result_summaries(self, profile_id: uuid.UUID) -> tuple[ResultSummary, ...]:
        return summarize_results([_result("sql", 1, 5, 6, minute=1)])


def _client(service: FakeService) -> TestClient:
    app = create_app()
    app.state.training_service = service
    return TestClient(app)


def test_a_finished_round_is_stored_for_the_player() -> None:
    service = FakeService()
    body = {"game": "sql", "difficulty": 2, "solved": 4, "total": 6}

    response = _client(service).post("/api/training/results", json=body, headers=HEADERS)

    assert response.status_code == 204
    assert service.saved == [(PROFILE_ID, "sql", 2, 4, 6)]


def test_invalid_results_are_rejected() -> None:
    service = FakeService()
    client = _client(service)
    invalid = [
        {"game": "sql", "difficulty": 2, "solved": 7, "total": 6},
        {"game": "level0", "difficulty": 1, "solved": 1, "total": 2},
        {"game": "code", "difficulty": 4, "solved": 1, "total": 2},
        {"game": "memory", "difficulty": 1, "solved": 1, "total": 0},
    ]

    for body in invalid:
        assert client.post("/api/training/results", json=body, headers=HEADERS).status_code == 422

    assert service.saved == []


def test_the_summaries_are_listed_for_the_player() -> None:
    response = _client(FakeService()).get("/api/training/results", headers=HEADERS)

    assert response.status_code == 200
    summary = response.json()[0]
    assert (summary["game"], summary["difficulty"], summary["rounds"]) == ("sql", 1, 1)
    assert (summary["best"]["solved"], summary["best"]["total"]) == (5, 6)
