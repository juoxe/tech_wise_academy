import type { Difficulty } from "@/features/game/lib/difficulty";

/* The tasks of the game SQL-Bausteine (PostgreSQL). Each task names the wanted result, the tiles of
   the solution in their order, and distractors: tiles that the solution does not use. The tables are
   described in the task text, so the player can read the columns. The level sets the difficulty. */
export type SqlTask = {
  id: string;
  level: Difficulty;
  goal: string;
  solution: string[];
  distractors: string[];
};

export const SQL_TASKS: SqlTask[] = [
  {
    id: "berlin",
    level: 1,
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
    id: "no-city",
    level: 1,
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
    id: "count-customers",
    level: 1,
    goal: "Wie viele Kunden gibt es insgesamt? Tabelle customers (id, name, city).",
    solution: ["SELECT", "COUNT(*)", "FROM", "customers"],
    distractors: ["SUM(id)", "GROUP BY", "DISTINCT", "WHERE", "ORDER BY name"],
  },
  {
    id: "distinct-cities",
    level: 1,
    goal: "Alle verschiedenen Orte, sortiert nach dem Ort. Tabelle customers (id, name, city).",
    solution: [
      "SELECT",
      "DISTINCT",
      "city",
      "FROM",
      "customers",
      "ORDER BY",
      "city",
    ],
    distractors: ["GROUP BY", "COUNT(*)", "LIMIT 3", "HAVING", "UPDATE"],
  },
  {
    id: "name-length",
    level: 1,
    goal: "Die Namen aller Kunden mit der Länge des Namens, der kürzeste Name zuerst. Tabelle customers (id, name, city).",
    solution: [
      "SELECT",
      "name",
      ",",
      "LENGTH(name)",
      "FROM",
      "customers",
      "ORDER BY",
      "LENGTH(name)",
    ],
    distractors: ["GROUP BY", "COUNT(*)", "DISTINCT", "WHERE", "LIMIT 0"],
  },
  {
    id: "orders-of-one",
    level: 1,
    goal: "Alle Bestellungen des Kunden mit der id 7. Tabelle orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "*",
      "FROM",
      "orders",
      "WHERE",
      "customer_id",
      "=",
      "7",
    ],
    distractors: [
      "GROUP BY",
      "ORDER BY",
      "LIKE '7%'",
      "OR",
      "DELETE",
      "IS NULL",
    ],
  },
  {
    id: "ilike",
    level: 2,
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
    id: "orders-per-customer",
    level: 2,
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
    id: "orders-between",
    level: 2,
    goal: "Die Bestellungen mit einem Betrag von 10 bis 50 einschließlich, der kleinste Betrag zuerst. Tabelle orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "id",
      ",",
      "total",
      "FROM",
      "orders",
      "WHERE",
      "total",
      "BETWEEN",
      "10",
      "AND",
      "50",
      "ORDER BY",
      "total",
    ],
    distractors: ["GROUP BY", "OR", "LIMIT 10", "DISTINCT", "COUNT(*)", "DESC"],
  },
  {
    id: "top-five",
    level: 2,
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
  {
    id: "cities-min",
    level: 2,
    goal: "Die Anzahl der Kunden je Ort, nur Orte mit mindestens zwei Kunden. Tabelle customers (id, name, city).",
    solution: [
      "SELECT",
      "city",
      ",",
      "COUNT(*)",
      "FROM",
      "customers",
      "GROUP BY",
      "city",
      "HAVING",
      "COUNT(*)",
      ">=",
      "2",
    ],
    distractors: [
      "WHERE",
      "DISTINCT",
      "ORDER BY name",
      "LIMIT 2",
      "SUM(id)",
      "UNION",
    ],
  },
  {
    id: "orders-in-list",
    level: 2,
    goal: "Die Bestellungen der Kunden mit den ids 1, 4 und 9. Tabelle orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "*",
      "FROM",
      "orders",
      "WHERE",
      "customer_id",
      "IN",
      "(1, 4, 9)",
    ],
    distractors: [
      "BETWEEN",
      "LIKE",
      "NOT IN (1)",
      "OR customer_id = 2",
      "GROUP BY",
      "COUNT(*)",
    ],
  },
  {
    id: "join-customers",
    level: 3,
    goal: "Pro Kunde (Name) die Anzahl seiner Bestellungen. Auch Kunden ohne Bestellung kommen vor, mit 0. Tabellen customers (id, name, city) und orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "c.name",
      ",",
      "COUNT(o.id)",
      "FROM",
      "customers c",
      "LEFT JOIN",
      "orders o",
      "ON",
      "o.customer_id = c.id",
      "GROUP BY",
      "c.name",
    ],
    distractors: [
      "INNER JOIN",
      "WHERE o.total > 0",
      "HAVING COUNT(*) > 0",
      "DISTINCT",
      "SUM(o.total)",
    ],
  },
  {
    id: "sum-per-customer",
    level: 3,
    goal: "Die Kunden mit einer Bestellsumme über 100, die größte Summe zuerst. Tabelle orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "customer_id",
      ",",
      "SUM(total)",
      "FROM",
      "orders",
      "GROUP BY",
      "customer_id",
      "HAVING",
      "SUM(total)",
      ">",
      "100",
      "ORDER BY",
      "SUM(total)",
      "DESC",
    ],
    distractors: [
      "COUNT(*)",
      "WHERE",
      "LIMIT",
      "AVG(total)",
      "DISTINCT",
      "DELETE",
    ],
  },
  {
    id: "customers-no-orders",
    level: 3,
    goal: "Die Namen der Kunden ohne Bestellung. Tabellen customers (id, name, city) und orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "c.name",
      "FROM",
      "customers c",
      "LEFT JOIN",
      "orders o",
      "ON",
      "o.customer_id = c.id",
      "WHERE",
      "o.id",
      "IS NULL",
    ],
    distractors: [
      "INNER JOIN",
      "WHERE o.id IS NOT NULL",
      "HAVING",
      "DISTINCT",
      "RIGHT JOIN",
      "COUNT(*) = 0",
    ],
  },
  {
    id: "running-total",
    level: 3,
    goal: "Alle Bestellungen mit der laufenden Summe der Beträge, in der Reihenfolge der id. Tabelle orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "id",
      ",",
      "total",
      ",",
      "SUM(total)",
      "OVER (ORDER BY id)",
      "FROM",
      "orders",
    ],
    distractors: [
      "GROUP BY",
      "PARTITION BY customer_id",
      "AVG(total)",
      "ROW_NUMBER()",
      "LIMIT 5",
      "WHERE total > 0",
    ],
  },
  {
    id: "rank-orders",
    level: 3,
    goal: "Alle Bestellungen mit ihrem Rang nach Betrag. Rang 1 ist die teuerste Bestellung. Tabelle orders (id, customer_id, total).",
    solution: [
      "SELECT",
      "id",
      ",",
      "total",
      ",",
      "RANK()",
      "OVER (ORDER BY total DESC)",
      "FROM",
      "orders",
    ],
    distractors: [
      "GROUP BY",
      "ROW_NUMBER()",
      "PARTITION BY customer_id",
      "LIMIT 1",
      "WHERE",
      "AVG(total)",
    ],
  },
];

/* The tasks of one level, in the order of the game. */
export function sqlTasksOf(level: Difficulty): SqlTask[] {
  return SQL_TASKS.filter((task) => task.level === level);
}

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

/* The task at a position of the given tasks; the position is always within them. */
export function taskAt(tasks: readonly SqlTask[], position: number): SqlTask {
  const task = tasks[position];
  if (task === undefined) {
    throw new Error(`Keine SQL-Aufgabe an Position ${position}`);
  }
  return task;
}
