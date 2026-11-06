"""Learning content: a sixth area for development tools and knowledge (TWA-12.7, TWA-12.8).

The Tech Tool Trainer had twelve tool types; tools of the types that are no area of their own
(editors, IDEs, API and database clients, note and diagram tools) were filed under the area of the
path where they appeared. They move to the new area `DEV_ENV` ("Entwicklung & Wissen"). The
migration also fixes a grammar error in the summary of Hashcat (TWA-12.8).

Revision ID: 0015
Revises: 0014
Create Date: 2026-11-06
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0015"
down_revision: str | None = "0014"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

AREAS = ("DEVOPS", "BACKEND", "FRONTEND", "SECURITY", "AI_DATA")

# The tools that move, with the area they had before (used by the downgrade).
MOVED = {
    "obsidian": "BACKEND",
    "mermaid": "DEVOPS",
    "intellij-idea": "BACKEND",
    "visual-studio-code": "FRONTEND",
    "postman": "BACKEND",
    "dbeaver": "BACKEND",
    "pgadmin": "BACKEND",
    "swagger-ui": "BACKEND",
    "sdkman": "BACKEND",
    "dev-containers": "BACKEND",
    "figma": "FRONTEND",
    "chrome-devtools": "FRONTEND",
    "react-devtools": "FRONTEND",
}

_HASHCAT_REST = (
    " Werkzeug zum Knacken von Passwort-Hashes, nutzt Grafikkarten für enorme Geschwindigkeit."
)
HASHCAT_OLD = "Schnellster" + _HASHCAT_REST
HASHCAT_NEW = "Schnellstes" + _HASHCAT_REST


def _check(categories: Sequence[str]) -> str:
    values = ", ".join(f"'{category}'" for category in categories)
    return f"category IN ({values})"


def _paradigm_aware(categories: Sequence[str]) -> str:
    return _check(tuple(categories) + ("LANGUAGE",))


def upgrade() -> None:
    connection = op.get_bind()
    op.drop_constraint("tool_category_values", "tool", type_="check")
    op.create_check_constraint(
        "tool_category_values", "tool", _paradigm_aware(AREAS + ("DEV_ENV",))
    )
    connection.execute(
        sa.text("UPDATE tool SET category = 'DEV_ENV' WHERE key = ANY(:keys)"),
        {"keys": list(MOVED)},
    )
    # Only the unchanged text is replaced, so a text that someone has edited stays.
    connection.execute(
        sa.text(
            "UPDATE tool_translation SET summary = :new WHERE summary = :old AND language = 'de' "
            "AND tool_id = (SELECT id FROM tool WHERE key = 'hashcat')"
        ),
        {"new": HASHCAT_NEW, "old": HASHCAT_OLD},
    )


def downgrade() -> None:
    connection = op.get_bind()
    cases = " ".join(f"WHEN '{key}' THEN '{area}'" for key, area in MOVED.items())
    # A tool that was added to the new area later has no former area; it goes to BACKEND.
    connection.execute(
        sa.text(
            f"UPDATE tool SET category = CASE key {cases} ELSE 'BACKEND' END "
            "WHERE category = 'DEV_ENV'"
        )
    )
    op.drop_constraint("tool_category_values", "tool", type_="check")
    op.create_check_constraint("tool_category_values", "tool", _paradigm_aware(AREAS))
    connection.execute(
        sa.text(
            "UPDATE tool_translation SET summary = :old WHERE summary = :new AND language = 'de' "
            "AND tool_id = (SELECT id FROM tool WHERE key = 'hashcat')"
        ),
        {"new": HASHCAT_NEW, "old": HASHCAT_OLD},
    )
