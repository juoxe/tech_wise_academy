"""Rules of the seed data: a hint never reveals its tool, and alternatives are symmetric."""

import json
from importlib import resources


def _seed_tools() -> list[dict]:
    text = resources.files("tech_wise_academy.learning_content").joinpath("seed_tools.json")
    return json.loads(text.read_text(encoding="utf-8"))["tools"]


def test_no_hint_contains_the_name_of_its_tool() -> None:
    for tool in _seed_tools():
        name = tool["name"].casefold()
        for hint in tool["hints_de"]:
            assert name not in hint.casefold(), f"hint of {tool['key']} names the tool: {hint}"


def test_alternatives_are_symmetric_and_refer_to_existing_tools() -> None:
    tools = {tool["key"]: tool for tool in _seed_tools()}
    for tool in tools.values():
        for other in tool["alternatives"]:
            assert other in tools, f"{tool['key']} refers to unknown tool {other}"
            assert tool["key"] in tools[other]["alternatives"], (
                f"{tool['key']} lists {other}, but {other} does not list {tool['key']}"
            )
