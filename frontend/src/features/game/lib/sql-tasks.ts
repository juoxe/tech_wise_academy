/* The tasks of the game SQL-Bausteine (PostgreSQL). Each task names the wanted result, the tiles of
   the solution in their order, and distractors: tiles that the solution does not use. The tables are
   described in the task text, so the player can read the columns. */
export type SqlTask = {
  id: string;
  goal: string;
  solution: string[];
  distractors: string[];
};

export const SQL_TASKS: SqlTask[] = [
  {
    id: "berlin",
    goal: "Alle Kunden aus Berlin, sortiert nach Name. Tabelle customers (id, name, city).",
    solution: [
      "SELECT",
      "*",
      "FROM",
      "customers",
      "WHERE",
      "city",
      "=",
      "'Berlin'",
      "ORDER BY",
      "name",
    ],
    distractors: [
      "GROUP BY",
      "DELETE",
      "HAVING",
      "UPDATE",
      "LIMIT 10",
      "OFFSET 5",
    ],
  },
  {
    id: "ilike",
    goal: "Die Namen aller Kunden, die mit „an“ beginnen, ohne Unterschied zwischen Groß- und Kleinschreibung. Tabelle customers (id, name, city).",
    solution: [
      "SELECT",
      "name",
      "FROM",
      "customers",
      "WHERE",
      "name",
      "ILIKE",
      "'an%'",
    ],
    distractors: [
      "ORDER BY",
      "LIMIT 5",
      "IS NULL",
      "LIKE",
      "NOT",
      "UPPER(name)",
    ],
  },
  {
    id: "no-city",
    goal: "Die Namen der Kunden, für die kein Ort hinterlegt ist. Tabelle customers (id, name, city).",
    solution: [
      "SELECT",
      "name",
      "FROM",
      "customers",
      "WHERE",
      "city",
      "IS NULL",
    ],
    distractors: ["DISTINCT", "GROUP BY", "OR", "IS NOT NULL", "=", "LIMIT 1"],
  },
  {
    id: "orders-per-customer",
    goal: "Pro Kunde die Anzahl der Bestellungen, nur Kunden mit mehr als zwei Bestellungen. Tabelle orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "customer_id",
      ",",
      "COUNT(*)",
      "FROM",
      "orders",
      "GROUP BY",
      "customer_id",
      "HAVING",
      "COUNT(*)",
      ">",
      "2",
    ],
    distractors: [
      "DISTINCT",
      "ORDER BY",
      "LIMIT",
      "WHERE",
      "SUM(total)",
      "DELETE",
    ],
  },
  {
    id: "top-five",
    goal: "Die fünf teuersten Bestellungen, die teuerste zuerst. Tabelle orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "*",
      "FROM",
      "orders",
      "ORDER BY",
      "total",
      "DESC",
      "LIMIT",
      "5",
    ],
    distractors: [
      "GROUP BY",
      "AVG(total)",
      "WHERE",
      "ASC",
      "OFFSET 5",
      "COUNT(*)",
    ],
  },
];

/* The answer is right when its tiles are the tiles of the solution in the same order. */
export function isSolved(task: SqlTask, answer: string[]): boolean {
  return (
    answer.length === task.solution.length &&
    answer.every((tile, index) => tile === task.solution[index])
  );
}

/* All tiles of a task: the solution tiles and the distractors. */
export function tilesOf(task: SqlTask): string[] {
  return [...task.solution, ...task.distractors];
}

/* The task at a position of the game; the position is always within SQL_TASKS. */
export function taskAt(position: number): SqlTask {
  const task = SQL_TASKS[position];
  if (task === undefined) {
    throw new Error(`Keine SQL-Aufgabe an Position ${position}`);
  }
  return task;
}
