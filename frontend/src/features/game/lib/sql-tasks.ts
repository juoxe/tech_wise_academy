import type { Difficulty } from "@/features/game/lib/difficulty";

/* The tasks of the game SQL-Bausteine (PostgreSQL). Each task names the wanted result and says in
   full sentences which tables and columns exist, so the player can read them. Then come the tiles of
   the solution in their order and distractors: tiles that the solution does not use. The level sets
   the difficulty: Kennen uses one table, Intermediate joins and grouping over several tables, Expert
   subqueries, common table expressions and window functions.

   The tables of all tasks (the descriptions are repeated in every task text):
   customer (id, name, city, created_at), orders (id, customer_id, order_date, total),
   product (id, name, price, category), order_item (order_id, product_id, quantity),
   employee (id, name, department, salary, manager_id). */
export type SqlTask = {
  id: string;
  level: Difficulty;
  goal: string;
  solution: string[];
  distractors: string[];
};

const CUSTOMER =
  "Die Tabelle customer hat die Spalten id, name, city und created_at.";
const PRODUCT =
  "Die Tabelle product hat die Spalten id, name, price und category.";
const ORDERS =
  "Die Tabelle orders hat die Spalten id, customer_id, order_date und total.";
const ORDER_ITEM =
  "Die Tabelle order_item hat die Spalten order_id, product_id und quantity.";
const EMPLOYEE =
  "Die Tabelle employee hat die Spalten id, name, department, salary und manager_id.";

export const SQL_TASKS: SqlTask[] = [
  /* Level 1 – Kennen: one table. */
  {
    id: "berlin",
    level: 1,
    goal: `Zeige alle Kunden aus Berlin, sortiert nach Name. ${CUSTOMER}`,
    solution: [
      "SELECT",
      "*",
      "FROM",
      "customer",
      "WHERE",
      "city",
      "=",
      "'Berlin'",
      "ORDER BY",
      "name",
    ],
    distractors: ["GROUP BY", "DELETE", "HAVING", "UPDATE", "LIMIT 10"],
  },
  {
    id: "no-city",
    level: 1,
    goal: `Zeige die Namen der Kunden, für die kein Ort hinterlegt ist. ${CUSTOMER}`,
    solution: [
      "SELECT",
      "name",
      "FROM",
      "customer",
      "WHERE",
      "city",
      "IS NULL",
    ],
    distractors: ["DISTINCT", "GROUP BY", "OR", "IS NOT NULL", "= NULL"],
  },
  {
    id: "count-customers",
    level: 1,
    goal: `Wie viele Kunden gibt es insgesamt? ${CUSTOMER}`,
    solution: ["SELECT", "COUNT(*)", "FROM", "customer"],
    distractors: ["SUM(id)", "GROUP BY", "DISTINCT", "WHERE", "ORDER BY name"],
  },
  {
    id: "distinct-cities",
    level: 1,
    goal: `Zeige alle verschiedenen Orte, aus denen Kunden kommen, alphabetisch sortiert. ${CUSTOMER}`,
    solution: [
      "SELECT",
      "DISTINCT",
      "city",
      "FROM",
      "customer",
      "ORDER BY",
      "city",
    ],
    distractors: ["GROUP BY", "COUNT(*)", "WHERE", "DESC", "LIMIT 1"],
  },
  {
    id: "expensive-products",
    level: 1,
    goal: `Zeige Name und Preis aller Produkte, die mehr als 50 kosten, das teuerste zuerst. ${PRODUCT}`,
    solution: [
      "SELECT",
      "name",
      ",",
      "price",
      "FROM",
      "product",
      "WHERE",
      "price",
      ">",
      "50",
      "ORDER BY",
      "price",
      "DESC",
    ],
    distractors: ["<", "ASC", "HAVING", "GROUP BY", "MAX(price)"],
  },
  {
    id: "latest-orders",
    level: 1,
    goal: `Zeige die fünf neuesten Bestellungen. ${ORDERS}`,
    solution: [
      "SELECT",
      "*",
      "FROM",
      "orders",
      "ORDER BY",
      "order_date",
      "DESC",
      "LIMIT 5",
    ],
    distractors: ["ASC", "OFFSET 5", "GROUP BY", "WHERE", "TOP 5"],
  },
  {
    id: "name-starts-with-a",
    level: 1,
    goal: `Zeige die Namen aller Kunden, die mit „A“ beginnen. ${CUSTOMER}`,
    solution: [
      "SELECT",
      "name",
      "FROM",
      "customer",
      "WHERE",
      "name",
      "LIKE",
      "'A%'",
    ],
    distractors: ["=", "'%A'", "IN", "HAVING", "BETWEEN"],
  },
  {
    id: "cheapest-price",
    level: 1,
    goal: `Wie hoch ist der niedrigste Preis aller Produkte? ${PRODUCT}`,
    solution: ["SELECT", "MIN(price)", "FROM", "product"],
    distractors: [
      "MAX(price)",
      "AVG(price)",
      "GROUP BY",
      "ORDER BY price",
      "DISTINCT",
    ],
  },

  /* Level 2 – Intermediate: joins of two or three tables, grouping. */
  {
    id: "customers-with-orders",
    level: 2,
    goal: `Zeige zu jeder Bestellung den Namen des Kunden, das Datum und die Summe. ${CUSTOMER} ${ORDERS} Jede Bestellung gehört über orders.customer_id zu einem Kunden.`,
    solution: [
      "SELECT",
      "c.name",
      ",",
      "o.order_date",
      ",",
      "o.total",
      "FROM",
      "customer c",
      "JOIN",
      "orders o",
      "ON",
      "o.customer_id = c.id",
    ],
    distractors: ["LEFT JOIN", "WHERE", "GROUP BY", "UNION", "c.id = o.id"],
  },
  {
    id: "customers-no-orders",
    level: 2,
    goal: `Zeige die Namen der Kunden, die noch nie bestellt haben. ${CUSTOMER} ${ORDERS} Jede Bestellung gehört über orders.customer_id zu einem Kunden.`,
    solution: [
      "SELECT",
      "c.name",
      "FROM",
      "customer c",
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
      "RIGHT JOIN",
      "IS NOT NULL",
      "HAVING",
      "COUNT(*) = 0",
    ],
  },
  {
    id: "orders-per-customer",
    level: 2,
    goal: `Wie viele Bestellungen hat jeder Kunde aufgegeben? Zeige den Namen und die Anzahl. ${CUSTOMER} ${ORDERS} Jede Bestellung gehört über orders.customer_id zu einem Kunden.`,
    solution: [
      "SELECT",
      "c.name",
      ",",
      "COUNT(o.id)",
      "FROM",
      "customer c",
      "JOIN",
      "orders o",
      "ON",
      "o.customer_id = c.id",
      "GROUP BY",
      "c.name",
    ],
    distractors: [
      "WHERE",
      "HAVING",
      "SUM(o.total)",
      "LEFT JOIN",
      "ORDER BY o.id",
    ],
  },
  {
    id: "big-customers",
    level: 2,
    goal: `Zeige die Namen der Kunden, deren Bestellungen zusammen mehr als 1000 ergeben. ${CUSTOMER} ${ORDERS} Jede Bestellung gehört über orders.customer_id zu einem Kunden.`,
    solution: [
      "SELECT",
      "c.name",
      "FROM",
      "customer c",
      "JOIN",
      "orders o",
      "ON",
      "o.customer_id = c.id",
      "GROUP BY",
      "c.name",
      "HAVING",
      "SUM(o.total)",
      ">",
      "1000",
    ],
    distractors: ["WHERE", "COUNT(*)", "LEFT JOIN", "AVG(o.total)", "ORDER BY"],
  },
  {
    id: "items-of-order",
    level: 2,
    goal: `Zeige Name und Menge aller Produkte der Bestellung mit der Nummer 42. ${PRODUCT} ${ORDER_ITEM} Jede Position verweist über order_item.product_id auf ein Produkt.`,
    solution: [
      "SELECT",
      "p.name",
      ",",
      "i.quantity",
      "FROM",
      "order_item i",
      "JOIN",
      "product p",
      "ON",
      "p.id = i.product_id",
      "WHERE",
      "i.order_id = 42",
    ],
    distractors: ["LEFT JOIN", "GROUP BY", "p.id = 42", "HAVING", "UNION"],
  },
  {
    id: "orders-from-berlin",
    level: 2,
    goal: `Zeige die Nummer und die Summe aller Bestellungen von Kunden aus Berlin, die größte Summe zuerst. ${CUSTOMER} ${ORDERS} Jede Bestellung gehört über orders.customer_id zu einem Kunden.`,
    solution: [
      "SELECT",
      "o.id",
      ",",
      "o.total",
      "FROM",
      "orders o",
      "JOIN",
      "customer c",
      "ON",
      "c.id = o.customer_id",
      "WHERE",
      "c.city = 'Berlin'",
      "ORDER BY",
      "o.total",
      "DESC",
    ],
    distractors: ["GROUP BY", "ASC", "LEFT JOIN", "HAVING", "c.city = Berlin"],
  },
  {
    id: "employee-manager",
    level: 2,
    goal: `Zeige zu jedem Mitarbeiter den Namen seiner Chefin oder seines Chefs. ${EMPLOYEE} Die Spalte manager_id verweist auf die id eines anderen Mitarbeiters.`,
    solution: [
      "SELECT",
      "e.name",
      ",",
      "m.name",
      "FROM",
      "employee e",
      "JOIN",
      "employee m",
      "ON",
      "m.id = e.manager_id",
    ],
    distractors: ["LEFT JOIN", "WHERE", "GROUP BY", "e.id = m.id", "UNION"],
  },
  {
    id: "avg-salary",
    level: 2,
    goal: `Zeige für jede Abteilung das durchschnittliche Gehalt, die Abteilung mit dem höchsten Durchschnitt zuerst. ${EMPLOYEE}`,
    solution: [
      "SELECT",
      "department",
      ",",
      "AVG(salary)",
      "FROM",
      "employee",
      "GROUP BY",
      "department",
      "ORDER BY",
      "AVG(salary)",
      "DESC",
    ],
    distractors: ["WHERE", "HAVING", "SUM(salary)", "ASC", "DISTINCT"],
  },

  /* Level 3 – Expert: subqueries, common table expressions, window functions. */
  {
    id: "unordered-products",
    level: 3,
    goal: `Zeige die Namen der Produkte, die noch nie bestellt wurden. ${PRODUCT} ${ORDER_ITEM} Jede Position verweist über order_item.product_id auf ein Produkt.`,
    solution: [
      "SELECT",
      "p.name",
      "FROM",
      "product p",
      "LEFT JOIN",
      "order_item i",
      "ON",
      "i.product_id = p.id",
      "WHERE",
      "i.order_id",
      "IS NULL",
    ],
    distractors: [
      "INNER JOIN",
      "RIGHT JOIN",
      "IS NOT NULL",
      "HAVING",
      "GROUP BY",
    ],
  },
  {
    id: "above-average-orders",
    level: 3,
    goal: `Zeige die Namen der Kunden, die mindestens eine Bestellung über dem Durchschnitt aller Bestellsummen haben. ${CUSTOMER} ${ORDERS} Jede Bestellung gehört über orders.customer_id zu einem Kunden.`,
    solution: [
      "SELECT",
      "name",
      "FROM",
      "customer",
      "WHERE",
      "id",
      "IN",
      "(SELECT customer_id",
      "FROM",
      "orders",
      "WHERE",
      "total",
      ">",
      "(SELECT AVG(total)",
      "FROM",
      "orders))",
    ],
    distractors: ["JOIN", "GROUP BY", "HAVING", "<", "NOT IN"],
  },
  {
    id: "top-customers-cte",
    level: 3,
    goal: `Zeige die drei Kunden mit der größten Gesamtsumme ihrer Bestellungen, mit Name und Summe. Berechne die Summe pro Kunde zuerst in einer WITH-Abfrage. ${CUSTOMER} ${ORDERS} Jede Bestellung gehört über orders.customer_id zu einem Kunden.`,
    solution: [
      "WITH revenue AS (",
      "SELECT customer_id",
      ",",
      "SUM(total) AS sum_total",
      "FROM",
      "orders",
      "GROUP BY",
      "customer_id )",
      "SELECT",
      "c.name",
      ",",
      "r.sum_total",
      "FROM",
      "customer c",
      "JOIN",
      "revenue r",
      "ON",
      "r.customer_id = c.id",
      "ORDER BY",
      "r.sum_total",
      "DESC",
      "LIMIT 3",
    ],
    distractors: ["HAVING", "LEFT JOIN", "WHERE", "ASC", "DISTINCT"],
  },
  {
    id: "salary-rank",
    level: 3,
    goal: `Zeige Name, Gehalt und den Rang des Gehalts innerhalb der Abteilung, das höchste Gehalt hat Rang 1. ${EMPLOYEE}`,
    solution: [
      "SELECT",
      "name",
      ",",
      "salary",
      ",",
      "RANK()",
      "OVER (",
      "PARTITION BY department",
      "ORDER BY salary DESC )",
      "FROM",
      "employee",
    ],
    distractors: [
      "GROUP BY department",
      "ROW_NUMBER()",
      "HAVING",
      "ORDER BY salary ASC )",
      "WHERE",
    ],
  },
  {
    id: "running-total",
    level: 3,
    goal: `Zeige Datum und Summe jeder Bestellung und daneben die laufende Summe aller Bestellungen bis zu diesem Datum. ${ORDERS}`,
    solution: [
      "SELECT",
      "order_date",
      ",",
      "total",
      ",",
      "SUM(total)",
      "OVER (",
      "ORDER BY order_date )",
      "FROM",
      "orders",
    ],
    distractors: [
      "GROUP BY order_date",
      "COUNT(*)",
      "PARTITION BY customer_id",
      "HAVING",
      "AVG(total)",
    ],
  },
  {
    id: "best-selling-products",
    level: 3,
    goal: `Zeige die fünf Produkte mit dem höchsten Umsatz (Menge mal Preis), mit Name und Umsatz. ${PRODUCT} ${ORDER_ITEM} Jede Position verweist über order_item.product_id auf ein Produkt.`,
    solution: [
      "SELECT",
      "p.name",
      ",",
      "SUM(i.quantity * p.price)",
      "FROM",
      "product p",
      "JOIN",
      "order_item i",
      "ON",
      "i.product_id = p.id",
      "GROUP BY",
      "p.name",
      "ORDER BY",
      "SUM(i.quantity * p.price)",
      "DESC",
      "LIMIT 5",
    ],
    distractors: ["LEFT JOIN", "WHERE", "HAVING", "ASC", "COUNT(*)"],
  },
  {
    id: "exists-big-order",
    level: 3,
    goal: `Zeige die Namen der Kunden, die mindestens eine Bestellung über 500 haben. Prüfe das mit EXISTS. ${CUSTOMER} ${ORDERS} Jede Bestellung gehört über orders.customer_id zu einem Kunden.`,
    solution: [
      "SELECT",
      "c.name",
      "FROM",
      "customer c",
      "WHERE",
      "EXISTS (",
      "SELECT 1",
      "FROM",
      "orders o",
      "WHERE",
      "o.customer_id = c.id",
      "AND",
      "o.total > 500 )",
    ],
    distractors: ["NOT EXISTS (", "JOIN", "GROUP BY", "OR", "HAVING"],
  },
  {
    id: "second-highest-salary",
    level: 3,
    goal: `Wie hoch ist das zweithöchste Gehalt aller Mitarbeiter? ${EMPLOYEE}`,
    solution: [
      "SELECT",
      "MAX(salary)",
      "FROM",
      "employee",
      "WHERE",
      "salary",
      "<",
      "(SELECT MAX(salary)",
      "FROM",
      "employee)",
    ],
    distractors: [">", "MIN(salary)", "GROUP BY", "LIMIT 2", "HAVING"],
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
