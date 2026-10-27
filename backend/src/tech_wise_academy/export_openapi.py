"""Writes the OpenAPI description to a file; the frontend generates its types from it (TD-19)."""

import json
import sys
from pathlib import Path

from tech_wise_academy.main import create_app


def main() -> None:
    target = Path(sys.argv[1])
    target.write_text(json.dumps(create_app().openapi(), indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
