import { DIFFICULTIES } from "@/features/game";
import { categoryLabel, useTools } from "@/features/tools";
import {
  usePriorities,
  useProgress,
  useResults,
  type ProgressEntry,
  type ResultSummary,
  type Scores,
  type TrainingGame,
} from "@/features/training";
import { QueryState } from "@/components/shared/query-state";
import type { ToolSummary } from "@/features/tools";
import {
  ROUND_GAMES,
  byArea,
  byLevel,
  byScore,
  describeResult,
  isLanguage,
  shareOf,
  stackShare,
  summarize,
  toolsToRepeat,
  type Share,
} from "@/features/statistics/lib/statistics";

/* The two knowledge games whose progress is saved. */
const GAMES: { game: TrainingGame; name: string }[] = [
  { game: "level0", name: "Wissens-Check" },
  { game: "clearing", name: "Karten abräumen" },
];

/* One row with a label, the learned count and a bar, like the progress bar in the Game tab. */
function ShareRow({ label, share }: { label: string; share: Share }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap justify-between gap-2 text-base">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground">
          {share.learned} von {share.total} gelernt · {share.percent} %
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={share.percent}
        className="h-3 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full bg-secondary transition-all"
          style={{ width: `${share.percent}%` }}
        />
      </div>
    </div>
  );
}

/* The statistics of one game: the summary, the progress per level and area, the tools to repeat. */
function GameStatistics({
  name,
  tools,
  entries,
  scores,
}: {
  name: string;
  tools: ToolSummary[];
  entries: ProgressEntry[];
  scores: Scores;
}) {
  const summary = summarize(tools, entries);
  const languages = tools.filter(isLanguage);
  const repeat = toolsToRepeat(tools, entries, 10, scores);
  const stack = stackShare(tools, entries, scores);
  const perScore = byScore(tools, entries, scores);
  return (
    <section
      aria-label={name}
      className="flex flex-col gap-5 rounded-md border border-border p-6"
    >
      <h2 className="text-2xl font-semibold">{name}</h2>

      <ShareRow label="Gelernte Werkzeuge" share={summary} />
      {stack.total > 0 && <ShareRow label="Mein Tech-Stack" share={stack} />}
      <p className="text-base">
        Antworten: <span className="font-semibold">{summary.correct}</span>{" "}
        richtig ·{" "}
        <span className="font-semibold text-destructive">{summary.wrong}</span>{" "}
        falsch
        {summary.accuracy === null ? "" : ` · ${summary.accuracy} % richtig`}
      </p>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Nach Level</h3>
        {byLevel(
          tools,
          entries,
          DIFFICULTIES.map((option) => option.level),
        ).map(({ level, share }) => (
          <ShareRow
            key={level}
            label={`Level ${level} · ${DIFFICULTIES.find((option) => option.level === level)?.name ?? ""}`}
            share={share}
          />
        ))}
      </div>

      {perScore.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Nach Priorität</h3>
          {perScore.map(({ score, label, share }) => (
            <ShareRow key={score} label={label} share={share} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Nach Bereich</h3>
        {byArea(tools, entries).map(({ area, share }) => (
          <ShareRow key={area} label={categoryLabel(area)} share={share} />
        ))}
        <ShareRow
          label="Programmiersprachen"
          share={shareOf(languages, entries)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Zum Wiederholen</h3>
        {repeat.length === 0 ? (
          <p className="text-base text-muted-foreground">
            Noch keine falschen Antworten.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {repeat.map(({ tool, wrong, correct }) => (
              <li
                key={tool.key}
                className="flex flex-wrap justify-between gap-2 text-base"
              >
                <span>
                  <span className="font-semibold">{tool.name}</span>{" "}
                  <span className="text-muted-foreground">
                    · {categoryLabel(tool.category)}
                  </span>
                </span>
                <span>
                  <span className="font-semibold text-destructive">
                    {wrong}
                  </span>{" "}
                  falsch · {correct} richtig
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* The results of the games without saved learning progress: per game and difficulty the rounds
   played, the latest and the best round. */
function RoundGamesStatistics({ summaries }: { summaries: ResultSummary[] }) {
  return (
    <section
      aria-label="Weitere Spiele"
      className="flex flex-col gap-5 rounded-md border border-border p-6"
    >
      <h2 className="text-2xl font-semibold">Weitere Spiele</h2>
      {ROUND_GAMES.map(({ game, name }) => {
        const rows = summaries
          .filter((summary) => summary.game === game)
          .sort((a, b) => a.difficulty - b.difficulty);
        return (
          <div key={game} className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">{name}</h3>
            {rows.length === 0 ? (
              <p className="text-base text-muted-foreground">
                Noch keine Runde gespielt.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {rows.map((row) => (
                  <li key={row.difficulty} className="flex flex-col text-base">
                    <span className="font-semibold">
                      {DIFFICULTIES.find(
                        (option) => option.level === row.difficulty,
                      )?.name ?? `Stufe ${row.difficulty}`}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {row.rounds} {row.rounds === 1 ? "Runde" : "Runden"}
                      </span>
                    </span>
                    <span>
                      Zuletzt: {describeResult(game, row.last)} · Beste:{" "}
                      {describeResult(game, row.best)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}

/* The Statistik tab: the saved progress of the two knowledge games, computed from the tool list and
   the progress of the player, and the stored rounds of the other three games. */
export function StatisticsPage() {
  const tools = useTools();
  const level0 = useProgress("level0");
  const clearing = useProgress("clearing");
  const results = useResults();
  const { scores } = usePriorities();
  const progressByGame = { level0, clearing };
  const allTools = tools.data ?? [];
  const nothingPlayed =
    GAMES.every(({ game }) => (progressByGame[game].data ?? []).length === 0) &&
    (results.data ?? []).length === 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-3xl font-bold">Statistik</h1>
      <QueryState
        isLoading={
          tools.isLoading ||
          level0.isLoading ||
          clearing.isLoading ||
          results.isLoading
        }
        error={tools.error ?? level0.error ?? clearing.error ?? results.error}
        isEmpty={nothingPlayed}
        emptyMessage="Noch keine Daten. Spiele zuerst eine Runde im Game-Tab."
      >
        {GAMES.map(({ game, name }) => (
          <GameStatistics
            key={game}
            name={name}
            tools={allTools}
            entries={progressByGame[game].data ?? []}
            scores={scores}
          />
        ))}
        <RoundGamesStatistics summaries={results.data ?? []} />
      </QueryState>
    </div>
  );
}
