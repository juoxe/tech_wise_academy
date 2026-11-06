"""Learning content: the core set of missing tools and languages, and the Llama update (TWA-12.10).

J chose the recommended core set of docu/catalogue-proposal.md on 2026-11-06: 38 tools and 4
languages (the file `seed_catalogue_2.json`). The migration skips a key that already exists, so a
tool that was added by hand stays. It also updates the entry "Meta Llama 3.3" to "Meta Llama 4"
(checked on the web on 2026-11-06: Llama 3.3 is no longer the current open model of Meta); only
the unchanged texts are replaced.

Revision ID: 0016
Revises: 0015
Create Date: 2026-11-06
"""

import json
import uuid
from collections.abc import Sequence
from importlib import resources

import sqlalchemy as sa
from alembic import op

revision: str = "0016"
down_revision: str | None = "0015"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SEED_NAMESPACE = uuid.UUID("6f1c2b1e-0c0a-4e8e-9c4b-7d1f3a2b5e10")

LLAMA_OLD_NAME = "Meta Llama 3.3"
LLAMA_NEW_NAME = "Meta Llama 4"
LLAMA_OLD_SUMMARY = (
    "Sprachmodell mit offenen Gewichten von Meta, das Texte versteht, schreibt und Code erzeugt."
)
LLAMA_NEW_SUMMARY = (
    "Modellfamilie mit offenen Gewichten von Meta (Llama 4 Scout und Maverick), "
    "die Texte und Bilder versteht und Code erzeugt."
)
LLAMA_OLD_EXAMPLE = "ollama run llama3.3"
LLAMA_NEW_EXAMPLE = "ollama run llama4"
LLAMA_OLD_OVERVIEW = (
    "Meta Llama 3.3 ist ein Sprachmodell von Meta mit offenen Gewichten. Es versteht und erzeugt "
    "Texte, beantwortet Fragen, fasst zusammen und schreibt Code. Die Gewichte kann man "
    "herunterladen und selbst betreiben, die Lizenz erlaubt eine breite Nutzung mit Bedingungen. "
    "Das Modell ist mehrsprachig und für Anweisungen im Dialog trainiert, braucht wegen seiner "
    "Größe aber viel Speicher."
)
LLAMA_NEW_OVERVIEW = (
    "Meta Llama 4 ist eine Modellfamilie von Meta mit offenen Gewichten, zu der Llama 4 Scout und "
    "Llama 4 Maverick gehören. Die Modelle verstehen und erzeugen Texte, verarbeiten auch Bilder, "
    "beantworten Fragen, fassen zusammen und schreiben Code. Die Gewichte kann man herunterladen "
    "und selbst betreiben, die Lizenz erlaubt eine breite Nutzung mit Bedingungen. Sie nutzen eine "
    "Mixture-of-Experts-Architektur und brauchen wegen ihrer Größe viel Speicher."
)


def _tool_id(key: str) -> uuid.UUID:
    """Same deterministic ids as in the earlier seed migrations."""
    return uuid.uuid5(SEED_NAMESPACE, key)


def _catalogue() -> list[dict]:
    text = resources.files("tech_wise_academy.learning_content").joinpath("seed_catalogue_2.json")
    return json.loads(text.read_text(encoding="utf-8"))["tools"]


def _swap_llama(connection: sa.Connection, old: dict[str, str], new: dict[str, str]) -> None:
    """Replaces the texts of the Llama entry, but only where they are still the unchanged ones."""
    key = {"key": "llama"}
    connection.execute(
        sa.text("UPDATE tool SET name = :new WHERE key = :key AND name = :old"),
        {**key, "new": new["name"], "old": old["name"]},
    )
    connection.execute(
        sa.text(
            "UPDATE tool_translation SET summary = :new WHERE language = 'de' AND summary = :old "
            "AND tool_id = (SELECT id FROM tool WHERE key = :key)"
        ),
        {**key, "new": new["summary"], "old": old["summary"]},
    )
    connection.execute(
        sa.text(
            "UPDATE tool_example SET code = :new WHERE code = :old "
            "AND tool_id = (SELECT id FROM tool WHERE key = :key)"
        ),
        {**key, "new": new["example"], "old": old["example"]},
    )
    connection.execute(
        sa.text(
            "UPDATE tool_translation SET content = jsonb_set(content, '{overview}', "
            "to_jsonb(CAST(:new AS text))) WHERE language = 'de' AND content->>'overview' = :old "
            "AND tool_id = (SELECT id FROM tool WHERE key = :key)"
        ),
        {**key, "new": new["overview"], "old": old["overview"]},
    )


def upgrade() -> None:
    connection = op.get_bind()
    _swap_llama(
        connection,
        {
            "name": LLAMA_OLD_NAME,
            "summary": LLAMA_OLD_SUMMARY,
            "example": LLAMA_OLD_EXAMPLE,
            "overview": LLAMA_OLD_OVERVIEW,
        },
        {
            "name": LLAMA_NEW_NAME,
            "summary": LLAMA_NEW_SUMMARY,
            "example": LLAMA_NEW_EXAMPLE,
            "overview": LLAMA_NEW_OVERVIEW,
        },
    )

    existing = {row[0] for row in connection.execute(sa.text("SELECT key FROM tool"))}
    tools = [tool for tool in _catalogue() if tool["key"] not in existing]
    for tool in tools:
        tool_id = _tool_id(tool["key"])
        connection.execute(
            sa.text(
                "INSERT INTO tool (id, key, name, category, paradigm, default_priority, "
                "documentation_url, icon) VALUES (:id, :key, :name, :category, :paradigm, "
                ":default_priority, :documentation_url, :icon)"
            ),
            {
                "id": tool_id,
                "key": tool["key"],
                "name": tool["name"],
                "category": tool["category"],
                "paradigm": tool.get("paradigm"),
                "default_priority": tool["default_priority"],
                "documentation_url": tool["documentation_url"],
                "icon": tool.get("icon"),
            },
        )
        connection.execute(
            sa.text(
                "INSERT INTO tool_translation (tool_id, language, summary, content) "
                "VALUES (:tool_id, 'de', :summary, CAST(:content AS jsonb))"
            ),
            {
                "tool_id": tool_id,
                "summary": tool["summary_de"],
                "content": json.dumps(tool["content_de"], ensure_ascii=False),
            },
        )
        for position, text in enumerate(tool["hints_de"], start=1):
            connection.execute(
                sa.text(
                    "INSERT INTO tool_hint (id, tool_id, language, position, text) "
                    "VALUES (:id, :tool_id, 'de', :position, :text)"
                ),
                {"id": uuid.uuid4(), "tool_id": tool_id, "position": position, "text": text},
            )
        for position, code in enumerate(tool.get("examples", []), start=1):
            connection.execute(
                sa.text(
                    "INSERT INTO tool_example (id, tool_id, position, code) "
                    "VALUES (:id, :tool_id, :position, :code)"
                ),
                {"id": uuid.uuid4(), "tool_id": tool_id, "position": position, "code": code},
            )

    # Alternatives are symmetric and stored once, the smaller ID first.
    known = existing | {tool["key"] for tool in tools}
    pairs = {
        tuple(sorted((_tool_id(tool["key"]), _tool_id(other))))
        for tool in tools
        for other in tool.get("alternatives", [])
        if other in known
    }
    for first, second in sorted(pairs):
        connection.execute(
            sa.text(
                "INSERT INTO tool_alternative (tool_id, alternative_tool_id) "
                "VALUES (:first, :second) ON CONFLICT DO NOTHING"
            ),
            {"first": first, "second": second},
        )


def downgrade() -> None:
    connection = op.get_bind()
    keys = [tool["key"] for tool in _catalogue()]
    # The texts, hints, examples and alternatives of a tool are deleted with it (ON DELETE CASCADE).
    connection.execute(sa.text("DELETE FROM tool WHERE key = ANY(:keys)"), {"keys": keys})
    _swap_llama(
        connection,
        {
            "name": LLAMA_NEW_NAME,
            "summary": LLAMA_NEW_SUMMARY,
            "example": LLAMA_NEW_EXAMPLE,
            "overview": LLAMA_NEW_OVERVIEW,
        },
        {
            "name": LLAMA_OLD_NAME,
            "summary": LLAMA_OLD_SUMMARY,
            "example": LLAMA_OLD_EXAMPLE,
            "overview": LLAMA_OLD_OVERVIEW,
        },
    )
