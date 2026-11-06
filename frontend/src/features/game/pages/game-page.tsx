import { useState } from "react";

import { CardDropBoard } from "@/features/game/components/card-drop-board";
import { ClearingBoard } from "@/features/game/components/clearing-board";
import { CodeReviewBoard } from "@/features/game/components/code-review-board";
import { MemoryBoard } from "@/features/game/components/memory-board";
import { SqlTileBoard } from "@/features/game/components/sql-tile-board";
import { DIFFICULTIES, type Difficulty } from "@/features/game/lib/difficulty";
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
  STACK_SCORE,
  scoreOf,
  usePriorities,
  useProgress,
  useResetProgress,
  weightOf,
  type ProgressEntry,
  type Scores,
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
const LEVELS = DIFFICULTIES;

type Level = Difficulty;

/* The sets of cards: the tools (three levels, sorted by area), the programming languages (one level,
   sorted by paradigm), "Mein Tech-Stack" (the tools and languages the player gave a high score, one
   level) and the own sets, which hold the interview preparation: sets generated from a job
   advertisement (one level). */
const SETS = [
  { set: "tools", name: "Tools" },
  { set: "languages", name: "Programmiersprachen" },
  { set: "stack", name: "Mein Tech-Stack" },
  { set: "interview", name: "Eigene Sets" },
] as const;

type ToolSet = (typeof SETS)[number]["set"];

function isLanguage(tool: ToolSummary): boolean {
  return PARADIGMS.includes(tool.category);
}

/* The floor of the Wissens-Check. An interview set and the tech stack can mix tools and languages. */
function areasOf(set: ToolSet, tools: ToolSummary[]): readonly Area[] {
  if (set === "languages") {
    return PARADIGMS;
  }
  return (set === "interview" || set === "stack") && tools.some(isLanguage)
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
  scores: Scores,
): Status {
  const learnedKeys = new Set(
    entries.filter((entry) => entry.learned).map((entry) => entry.tool_key),
  );
  /* A tool with the score 0 is hidden: it is not played and does not block the next level. */
  const isShown = (tool: ToolSummary) => scoreOf(scores, tool.key) > 0;
  if (set !== "tools") {
    const title =
      set === "languages"
        ? "Programmiersprachen"
        : set === "stack"
          ? "Mein Tech-Stack"
          : interview.title;
    const tools = (
      set === "languages"
        ? allTools.filter(isLanguage)
        : set === "stack"
          ? allTools.filter((tool) => scoreOf(scores, tool.key) >= STACK_SCORE)
          : interview.tools
    ).filter(isShown);
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
    allTools.filter(
      (tool) =>
        !isLanguage(tool) && tool.level === levelNumber && isShown(tool),
    );
  /* A level is done when every shown tool is learned; a level with only hidden tools is done too. */
  const isLevelDone = (levelNumber: Level) =>
    toolsOf(levelNumber).every((tool) => learnedKeys.has(tool.key));
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
  const [sqlPlaying, setSqlPlaying] = useState(false);
  const [codeReviewPlaying, setCodeReviewPlaying] = useState(false);
  const [memoryPlaying, setMemoryPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [roundNumber, setRoundNumber] = useState(0);
  const [confirmReset, setConfirmReset] = useState<TrainingGame | null>(null);
  const resetProgress = useResetProgress();
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
  const { scores } = usePriorities();
  const status = statusOf(
    allTools,
    progress.data ?? [],
    set,
    interview,
    scores,
  );
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
  /* The importance scores: a card with a higher score comes up more often (see game-play.md). */
  const weights = Object.fromEntries(
    toolList.map((tool) => [tool.key, weightOf(scoreOf(scores, tool.key))]),
  );
  /* The cards of Memory: the chosen set without the hidden tools. */
  const memoryEntries = (
    set === "languages"
      ? allTools.filter(isLanguage)
      : set === "interview"
        ? interview.tools
        : set === "stack"
          ? allTools.filter((tool) => scoreOf(scores, tool.key) >= STACK_SCORE)
          : allTools.filter((tool) => !isLanguage(tool))
  ).filter((tool) => scoreOf(scores, tool.key) > 0);

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

  if (memoryPlaying) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Memory</h2>
          <button
            type="button"
            onClick={() => setMemoryPlaying(false)}
            className={BUTTON_OFF}
          >
            Anderes Spiel wählen
          </button>
        </div>
        <QueryState
          isLoading={tools.isLoading || interviewSet.isLoading}
          error={tools.error ?? interviewSet.error}
          isEmpty={false}
          emptyMessage=""
        >
          <MemoryBoard difficulty={difficulty} entries={memoryEntries} />
        </QueryState>
      </div>
    );
  }

  if (codeReviewPlaying) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Code beurteilen</h2>
          <button
            type="button"
            onClick={() => setCodeReviewPlaying(false)}
            className={BUTTON_OFF}
          >
            Anderes Spiel wählen
          </button>
        </div>
        <CodeReviewBoard difficulty={difficulty} />
      </div>
    );
  }

  if (sqlPlaying) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">SQL-Bausteine</h2>
          <button
            type="button"
            onClick={() => setSqlPlaying(false)}
            className={BUTTON_OFF}
          >
            Anderes Spiel wählen
          </button>
        </div>
        <SqlTileBoard difficulty={difficulty} />
      </div>
    );
  }

  if (!playing) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <h1 className="text-3xl font-bold">Welches Game willst du spielen?</h1>
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
        {set === "stack" && toolList.length === 0 && (
          <p className="text-base text-muted-foreground">
            Dein Tech-Stack ist noch leer. Gib den Tools, die du intensiv lernen
            willst, in der Toolübersicht die Priorität „Hoch“ oder „Kern“.
          </p>
        )}
        {((set === "interview" || set === "stack") && toolList.length === 0
          ? []
          : GAMES
        ).map((option) => {
          const gameStatus = statusOf(
            allTools,
            progressByGame[option.game].data ?? [],
            set,
            interview,
            scores,
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
                    className="h-full bg-secondary transition-all"
                    style={{ width: `${gameStatus.percent}%` }}
                  />
                </div>
              </div>
              {confirmReset === option.game ? (
                <div
                  role="alertdialog"
                  aria-label={`Fortschritt ${option.name} zurücksetzen`}
                  className="flex flex-col gap-3 rounded-md border border-destructive p-4"
                >
                  <p className="text-base">
                    Den Fortschritt von „{option.name}“ in allen Sets und Levels
                    wirklich löschen? Das lässt sich nicht rückgängig machen.
                  </p>
                  {resetProgress.error && (
                    <p role="alert" className="text-base text-destructive">
                      Das Zurücksetzen hat nicht geklappt.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={resetProgress.isPending}
                      onClick={() =>
                        resetProgress.mutate(option.game, {
                          onSuccess: () => setConfirmReset(null),
                        })
                      }
                      className="rounded-md border border-destructive px-4 py-2 text-base font-semibold text-destructive hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                    >
                      Ja, zurücksetzen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetProgress.reset();
                        setConfirmReset(null);
                      }}
                      className={BUTTON_OFF}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => start(option.game)}
                    className={BUTTON_ON}
                  >
                    Starten
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(option.game)}
                    className={BUTTON_OFF}
                  >
                    Fortschritt zurücksetzen
                  </button>
                </div>
              )}
            </section>
          );
        })}
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Schwierigkeit für SQL-Bausteine, Code beurteilen und Memory"
        >
          <span className="text-base font-semibold">Schwierigkeit:</span>
          {DIFFICULTIES.map((option) => (
            <button
              key={option.level}
              type="button"
              aria-pressed={difficulty === option.level}
              onClick={() => setDifficulty(option.level)}
              className={difficulty === option.level ? BUTTON_ON : BUTTON_OFF}
            >
              {option.name}
            </button>
          ))}
        </div>
        <section className="flex flex-col gap-3 rounded-md border border-border p-6">
          <h2 className="text-2xl font-semibold">SQL-Bausteine</h2>
          <p className="text-base text-muted-foreground">
            Baue eine PostgreSQL-Abfrage aus Bausteinen. Klicke die Bausteine in
            der Reihenfolge der Abfrage an. Nicht jeder Baustein wird gebraucht.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSqlPlaying(true)}
              className={BUTTON_ON}
            >
              Starten
            </button>
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-md border border-border p-6">
          <h2 className="text-2xl font-semibold">Code beurteilen</h2>
          <p className="text-base text-muted-foreground">
            Lies ein kurzes Code-Beispiel und markiere alle Aussagen, die
            stimmen. Mehrere Aussagen können richtig sein, auch keine oder alle.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCodeReviewPlaying(true)}
              className={BUTTON_ON}
            >
              Starten
            </button>
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-md border border-border p-6">
          <h2 className="text-2xl font-semibold">Memory</h2>
          <p className="text-base text-muted-foreground">
            Finde zu jedem Werkzeug oder jeder Programmiersprache die passende
            Beschreibung. Die Karten kommen aus dem gewählten Set.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMemoryPlaying(true)}
              className={BUTTON_ON}
            >
              Starten
            </button>
          </div>
        </section>
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
            className="h-full bg-secondary transition-all"
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
              {set === "interview" || set === "stack"
                ? "Alle Karten dieses Sets sind gelernt"
                : "Alle Tools dieses Levels sind gelernt"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {set === "interview" || set === "stack"
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
            weights={weights}
            onPlayAgain={playAgain}
          />
        ) : (
          <ClearingBoard
            key={`clearing-${set}-${interviewSetId}-${level}-${roundNumber}`}
            tools={openTools}
            weights={weights}
            onNextRound={playAgain}
          />
        )}
      </QueryState>
    </div>
  );
}
