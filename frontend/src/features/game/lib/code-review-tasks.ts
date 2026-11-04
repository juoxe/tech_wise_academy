/* The tasks of the game Code beurteilen. Each task shows a short code example and several statements
   about it. Any number of statements can be right, from none to all. Every statement carries the
   reason, so the learner sees why it is right or wrong after the check. */
export type CodeStatement = {
  text: string;
  correct: boolean;
  reason: string;
};

export type CodeTask = {
  id: string;
  language: "Python" | "SQL" | "TypeScript";
  question: string;
  code: string;
  statements: CodeStatement[];
};

export const CODE_TASKS: CodeTask[] = [
  {
    id: "sql-injection",
    language: "Python",
    question: "Welche Aussagen zu dieser Funktion stimmen?",
    code: `def find_user(conn, name):
    query = f"SELECT id, email FROM users WHERE name = '{name}'"
    return conn.execute(query).fetchall()`,
    statements: [
      {
        text: "Die Eingabe wird per f-String in den SQL-Text eingesetzt.",
        correct: true,
        reason:
          "Der Text der Eingabe wird Teil des SQL-Befehls. Ein Angreifer kann so eigene SQL-Befehle einschleusen (SQL-Injection).",
      },
      {
        text: "Die Werte sollten als Parameter übergeben werden, z. B. conn.execute(sql, (name,)).",
        correct: true,
        reason:
          "Mit Parametern trennt die Datenbank Befehl und Daten. Das ist der übliche Schutz gegen SQL-Injection.",
      },
      {
        text: "Die Funktion gibt alle Spalten der Tabelle zurück.",
        correct: false,
        reason:
          "Die Abfrage wählt nur die Spalten id und email aus. Das ist kein Fehler.",
      },
      {
        text: "Der Name der Funktion ist nicht aussagekräftig.",
        correct: false,
        reason:
          "Das ist eine Frage des Stils. Es ist keine Schwachstelle im Sinne der Sicherheit oder der Funktion.",
      },
    ],
  },
  {
    id: "hardcoded-password",
    language: "Python",
    question: "Welche Aussagen zu dieser Anmeldung stimmen?",
    code: `PASSWORD = "geheim123"

def login(user, pw):
    if pw == PASSWORD:
        return True
    return False`,
    statements: [
      {
        text: "Das Passwort steht fest im Code und ist in der Versionsverwaltung sichtbar.",
        correct: true,
        reason:
          "Wer den Code kennt, kennt das Passwort. Geheimnisse gehören in die Umgebung oder einen Secret-Speicher.",
      },
      {
        text: "Der Benutzername user wird nie geprüft.",
        correct: true,
        reason:
          "Jeder Benutzer wird angenommen, solange das Passwort stimmt. Die Anmeldung prüft nicht, wer sich anmeldet.",
      },
      {
        text: "Die Zeile mit return False könnte man zu return pw == PASSWORD verkürzen.",
        correct: false,
        reason:
          "Das stimmt, ist aber nur eine Vereinfachung des Stils. Es ist keine Schwachstelle.",
      },
    ],
  },
  {
    id: "innerhtml",
    language: "TypeScript",
    question: "Welche Aussagen zu dieser Funktion stimmen?",
    code: `function showComment(comment: string) {
  document.getElementById("out")!.innerHTML = comment;
}`,
    statements: [
      {
        text: "Ein Kommentar kann ein Skript enthalten, das im Browser der anderen Besucher läuft.",
        correct: true,
        reason:
          "innerHTML liest den Text als HTML. Ein eingeschleustes script-Element oder ein Ereignis-Attribut wird ausgeführt (Cross-Site-Scripting).",
      },
      {
        text: "Mit textContent statt innerHTML wird der Text nur als Text angezeigt.",
        correct: true,
        reason:
          "textContent fügt den Text ohne Auswertung als HTML ein. Damit ist der Angriff verhindert.",
      },
      {
        text: "getElementById ist langsamer als querySelector.",
        correct: false,
        reason:
          "Das ist für diese Frage nicht relevant. Es ist keine Schwachstelle.",
      },
      {
        text: "Die Funktion sollte async sein.",
        correct: false,
        reason:
          "Die Funktion macht nichts Asynchrones. async würde hier nichts verbessern.",
      },
    ],
  },
  {
    id: "file-read",
    language: "Python",
    question: "Welche Aussagen zu dieser Funktion stimmen?",
    code: `def read_config(path):
    f = open(path)
    data = f.read()
    return data`,
    statements: [
      {
        text: "Die Datei wird nie geschlossen; ein with-Block würde das sicherstellen.",
        correct: true,
        reason:
          "Die Datei bleibt offen, bis der Garbage Collector sie aufräumt. Bei vielen Aufrufen gehen dem Programm Dateideskriptoren aus.",
      },
      {
        text: "Wenn path aus einer Benutzereingabe stammt, kann ein Angreifer beliebige Dateien lesen (z. B. ../../etc/passwd).",
        correct: true,
        reason:
          "Ein ungeprüfter Pfad erlaubt Path Traversal. Der Pfad muss gegen ein erlaubtes Verzeichnis geprüft werden.",
      },
      {
        text: "Die Variable data könnte man sparen und direkt return f.read() schreiben.",
        correct: false,
        reason: "Das ist eine Stilfrage. Es ist keine Schwachstelle.",
      },
    ],
  },
  {
    id: "orders",
    language: "SQL",
    question: "Welche Aussagen zu dieser Abfrage stimmen?",
    code: `SELECT *
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.total > 100;`,
    statements: [
      {
        text: "SELECT * holt alle Spalten, auch die, die nicht gebraucht werden.",
        correct: true,
        reason:
          "Unnötige Spalten kosten Speicher und Übertragung. Ändert sich die Tabelle, ändert sich auch das Ergebnis. Man listet besser die gebrauchten Spalten auf.",
      },
      {
        text: "Der Alias o ist überflüssig.",
        correct: false,
        reason:
          "Der Alias macht die Abfrage kürzer und ist üblich. Er ist keine Schwachstelle.",
      },
      {
        text: "Der Filter o.total > 100 ist ungültig, weil total eine Zahl ist.",
        correct: false,
        reason:
          "Ein Vergleich einer Zahl mit 100 ist gültig. Das ist kein Fehler.",
      },
    ],
  },
];

/* A task is solved when exactly the right statements are marked. */
export function isTaskSolved(
  task: CodeTask,
  marked: readonly number[],
): boolean {
  return task.statements.every(
    (statement, index) => statement.correct === marked.includes(index),
  );
}
