import { useState } from "react";

import { CardDropBoard } from "@/features/game/components/card-drop-board";
import { ClearingBoard } from "@/features/game/components/clearing-board";
import {
  CATEGORIES,
  MIXED_AREAS,
  PARADIGMS,
  type Area,
  type SavedStreak,
} from "@/features/game/lib/drop";
import {
  InterviewPanel,
  useInterviewSet,
  useInterviewSets,
} from "@/features/interview";
import {
  useProgress,
  type ProgressEntry,
  type TrainingGame,
} from "@/features/training";
import { useTools } from "@/features/tools/hooks/use-tools";
import type { ToolSummary } from "@/features/tools";
import { QueryState } from "@/components/shared/query-state";

/* The games: the knowledge check (falling cards) and the card clearing (hint and field). */
const GAMES: { game: TrainingGame; name: string; description: string }[] = [
  {
    game: "level0",
    name: "Wissens-Check",
    description:
      "Karten fallen von oben. Lande jede Karte im Bereich des passenden Werkzeugs.",
  },
  {
    game: "clearing",
    name: "Karten abräumen",
    description:
      "Ein Hinweis steht über dem Feld. Klicke das Werkzeug an, das gemeint ist.",
  },
];

/* The three levels: level 1 holds the tools everybody should know, level 3 the expert tools. */
const LEVELS = [
  { level: 1, name: "Kennen" },
  { level: 2, name: "Intermediate" },
  { level: 3, name: "Expert" },
] as const;

type Level = (typeof LEVELS)[number]["level"];

/* The sets of cards: the tools (three levels, sorted by area), the programming languages (one level,
   sorted by paradigm) and the own sets, which hold the interview preparation: sets generated from a job advertisement (one
   level). */
const SETS = [
  { set: "tools", name: "Tools" },
  { set: "languages", name: "Programmiersprachen" },
  { set: "interview", name: "Eigene Sets" },
] as const;

type ToolSet = (typeof SETS)[number]["set"];

function isLanguage(tool: ToolSummary): boolean {
  return PARADIGMS.includes(tool.category);
}

/* The floor of the Wissens-Check. An interview set can mix tools and languages. */
function areasOf(set: ToolSet, tools: ToolSummary[]): readonly Area[] {
  if (set === "languages") {
    return PARADIGMS;
  }
  return set === "interview" && tools.some(isLanguage)
    ? MIXED_AREAS
    : CATEGORIES;
}

/* Where the player stands in one game: the level that is played now and its progress. */
type Status = {
  level: Level;
  levelName: string;
  title: string;
  tools: ToolSummary[];
  learnedKeys: Set<string>;
  learnedCount: number;
  percent: number;
};

const BUTTON_ON =
  "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary";
const BUTTON_OFF =
  "inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-base font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary";

/* The level is set automatically: the first open level whose tools are not all learned yet. A level
   opens when every tool of the level before it is learned. Level 1 is always open. */
function statusOf(
  allTools: ToolSummary[],
  entries: ProgressEntry[],
  set: ToolSet,
  interview: { title: string; tools: ToolSummary[] },
): Status {
  const learnedKeys = new Set(
    entries.filter((entry) => entry.learned).map((entry) => entry.tool_key),
  );
  if (set !== "tools") {
    const title = set === "languages" ? "Programmiersprachen" : interview.title;
    const tools =
      set === "languages" ? allTools.filter(isLanguage) : interview.tools;
    const learnedCount = tools.filter((tool) =>
      learnedKeys.has(tool.key),
    ).length;
    return {
      level: 1,
      levelName: title,
      title,
      tools,
      learnedKeys,
      learnedCount,
      percent:
        tools.length === 0
          ? 0
          : Math.round((learnedCount / tools.length) * 100),
    };
  }
  const toolsOf = (levelNumber: Level) =>
    allTools.filter((tool) => !isLanguage(tool) && tool.level === levelNumber);
  const isLevelDone = (levelNumber: Level) => {
    const inLevel = toolsOf(levelNumber);
    return (
      inLevel.length > 0 && inLevel.every((tool) => learnedKeys.has(tool.key))
    );
  };
  const isUnlocked = (levelNumber: Level) =>
    levelNumber === 1 || isLevelDone((levelNumber - 1) as Level);
  const level: Level =
    LEVELS.find(
      (option) => isUnlocked(option.level) && !isLevelDone(option.level),
    )?.level ?? 3;
  const tools = toolsOf(level);
  const learnedCount = tools.filter((tool) => learnedKeys.has(tool.key)).length;
  return {
    level,
    levelName: LEVELS.find((option) => option.level === level)?.name ?? "",
    title: `Level ${level} · ${LEVELS.find((option) => option.level === level)?.name ?? ""}`,
    tools,
    learnedKeys,
    learnedCount,
    percent:
      tools.length === 0 ? 0 : Math.round((learnedCount / tools.length) * 100),
  };
}

/* The Game tab: first the choice of the game with the progress of each game, then the game. */
export function GamePage() {
  const tools = useTools();
  const [game, setGame] = useState<TrainingGame>("level0");
  const [set, setSet] = useState<ToolSet>("tools");
  const [playing, setPlaying] = useState(false);
  const [roundNumber, setRoundNumber] = useState(0);
  const progressByGame: Record<TrainingGame, ReturnType<typeof useProgress>> = {
    level0: useProgress("level0"),
    clearing: useProgress("clearing"),
  };
  const progress = progressByGame[game];
  const allTools = tools.data ?? [];
  const interviewSets = useInterviewSets();
  const [chosenSetId, setChosenSetId] = useState<string>();
  const interviewSetId = chosenSetId ?? interviewSets.data?.[0]?.id;
  const interviewSet = useInterviewSet(
    set === "interview" ? interviewSetId : undefined,
  );
  const byKey = new Map(allTools.map((tool) => [tool.key, tool]));
  const interview = {
    title: interviewSet.data?.title ?? "Eigene Sets",
    tools: (interviewSet.data?.cards ?? []).flatMap(
      (card) => byKey.get(card.tool_key) ?? [],
    ),
  };
  const status = statusOf(allTools, progress.data ?? [], set, interview);
  const { level, title, learnedKeys, learnedCount, percent } = status;
  const toolList = status.tools;
  const levelKeys = new Set(toolList.map((tool) => tool.key));
  const saved: SavedStreak[] = (progress.data ?? [])
    .filter((entry) => levelKeys.has(entry.tool_key))
    .map((entry) => ({
      toolKey: entry.tool_key,
      streak: entry.correct_in_a_row,
      learned: entry.learned,
    }));
  const allLearned = toolList.length > 0 && learnedCount >= toolList.length;
  const openTools = toolList.filter((tool) => !learnedKeys.has(tool.key));
  const gameName = GAMES.find((option) => option.game === game)?.name;
  const areas = areasOf(set, toolList);

  async function playAgain() {
    await progress.refetch();
    setRoundNumber((n) => n + 1);
  }

  function start(next: TrainingGame) {
    setGame(next);
    setRoundNumber((n) => n + 1);
    setPlaying(true);
  }

  async function backToSelection() {
    setPlaying(false);
    await progress.refetch();
  }

  if (!playing) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <h1 className="text-3xl font-bold text-primary">
          Welches Game willst du spielen?
        </h1>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Set">
          {SETS.map((option) => (
            <button
              key={option.set}
              type="button"
              aria-pressed={set === option.set}
              onClick={() => setSet(option.set)}
              className={set === option.set ? BUTTON_ON : BUTTON_OFF}
            >
              {option.name}
            </button>
          ))}
        </div>
        {set === "interview" && (
          <InterviewPanel
            tools={allTools}
            selectedId={interviewSetId}
            onSelect={setChosenSetId}
          />
        )}
        {(set === "interview" && toolList.length === 0 ? [] : GAMES).map(
          (option) => {
            const gameStatus = statusOf(
              allTools,
              progressByGame[option.game].data ?? [],
              set,
              interview,
            );
            return (
              <section
                key={option.game}
                className="flex flex-col gap-3 rounded-md border border-border p-6"
              >
                <h2 className="text-2xl font-semibold">{option.name}</h2>
                <p className="text-base text-muted-foreground">
                  {option.description}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap justify-between gap-2 text-base">
                    <span className="font-semibold">{gameStatus.title}</span>
                    <span className="text-muted-foreground">
                      {gameStatus.percent} % gelernt
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Fortschritt ${option.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={gameStatus.percent}
                    className="h-3 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full bg-status-done transition-all"
                      style={{ width: `${gameStatus.percent}%` }}
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => start(option.game)}
                    className={BUTTON_ON}
                  >
                    Starten
                  </button>
                </div>
              </section>
            );
          },
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{gameName}</h2>
        <button type="button" onClick={backToSelection} className={BUTTON_OFF}>
          Anderes Spiel wählen
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap justify-between gap-2 text-base">
          <span className="font-semibold">{title}</span>
          <span className="text-muted-foreground">
            {learnedCount} von {toolList.length} gelernt
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Fortschritt im Level"
          aria-valuemin={0}
          aria-valuemax={toolList.length}
          aria-valuenow={learnedCount}
          className="h-3 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full bg-status-done transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <QueryState
        isLoading={tools.isLoading || progress.isLoading}
        error={tools.error ?? progress.error}
        isEmpty={toolList.length === 0}
        emptyMessage="Für dieses Set gibt es noch keine Begriffe."
      >
        {allLearned ? (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">
              {set === "interview"
                ? "Alle Karten dieses Sets sind gelernt"
                : "Alle Tools dieses Levels sind gelernt"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {set === "interview"
                ? "Für dieses Set gibt es keine offenen Karten mehr."
                : "Für dieses Level gibt es keine offenen Karten mehr."}
            </p>
          </section>
        ) : game === "level0" ? (
          <CardDropBoard
            key={`level0-${set}-${interviewSetId}-${level}-${roundNumber}`}
            tools={toolList}
            saved={saved}
            areas={areas}
            onPlayAgain={playAgain}
          />
        ) : (
          <ClearingBoard
            key={`clearing-${set}-${interviewSetId}-${level}-${roundNumber}`}
            tools={openTools}
            onNextRound={playAgain}
          />
        )}
      </QueryState>
    </div>
  );
}
