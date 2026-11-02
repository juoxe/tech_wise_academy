"""Interview sets: the vector extension, the tool embeddings and the generated card sets.

The vector columns have no fixed dimension, so the embedding model can be changed by configuration
(ADR-0006). Vectors of different models are never compared: every query filters by model.

Revision ID: 0008
Revises: 0007
Create Date: 2026-11-02
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0008"
down_revision: str | None = "0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute(
        """
        CREATE TABLE tool_embedding (
            tool_key TEXT NOT NULL,
            model TEXT NOT NULL,
            text_hash TEXT NOT NULL,
            embedding vector NOT NULL,
            PRIMARY KEY (tool_key, model)
        )
        """
    )
    op.execute(
        """
        CREATE TABLE interview_set (
            id UUID PRIMARY KEY,
            profile_id UUID NOT NULL,
            title TEXT NOT NULL,
            job_ad TEXT NOT NULL,
            model TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX interview_set_profile ON interview_set (profile_id, created_at)")
    op.execute(
        """
        CREATE TABLE interview_set_chunk (
            set_id UUID NOT NULL REFERENCES interview_set (id) ON DELETE CASCADE,
            position INTEGER NOT NULL,
            text TEXT NOT NULL,
            embedding vector NOT NULL,
            PRIMARY KEY (set_id, position)
        )
        """
    )
    op.execute(
        """
        CREATE TABLE interview_set_tool (
            set_id UUID NOT NULL REFERENCES interview_set (id) ON DELETE CASCADE,
            tool_key TEXT NOT NULL,
            similarity DOUBLE PRECISION NOT NULL,
            chunk_position INTEGER NOT NULL,
            mentioned BOOLEAN NOT NULL,
            rank INTEGER,
            PRIMARY KEY (set_id, tool_key)
        )
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE interview_set_tool")
    op.execute("DROP TABLE interview_set_chunk")
    op.execute("DROP TABLE interview_set")
    op.execute("DROP TABLE tool_embedding")
    op.execute("DROP EXTENSION vector")
