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


CONTENT_FIELDS = [
    "overview",
    "use_cases",
    "key_concepts",
    "when_to_use",
    "when_not_to_use",
    "good_to_know",
]


def test_every_tool_has_complete_learning_content() -> None:
    for tool in _seed_tools():
        content = tool.get("content_de")
        assert content is not None, f"{tool['key']} has no content"
        assert list(content) == CONTENT_FIELDS, f"{tool['key']} has wrong content fields"
        assert content["overview"].strip(), f"{tool['key']} has an empty overview"
        assert 3 <= len(content["use_cases"]) <= 4, f"{tool['key']} use cases"
        assert 3 <= len(content["key_concepts"]) <= 5, f"{tool['key']} key concepts"
        for concept in content["key_concepts"]:
            assert concept["term"].strip() and concept["explanation"].strip(), tool["key"]
        assert content["when_to_use"].strip(), f"{tool['key']} when to use"
        assert content["when_not_to_use"].strip(), f"{tool['key']} when not to use"
        assert 2 <= len(content["good_to_know"]) <= 3, f"{tool['key']} good to know"
