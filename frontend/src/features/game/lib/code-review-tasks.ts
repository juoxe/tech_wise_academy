import type { Difficulty } from "@/features/game/lib/difficulty";

/* The tasks of the game Code beurteilen. Each task shows a short code example and several statements
   about it. Any number of statements can be right, from none to all. Every statement carries the
   reason, so the learner sees why it is right or wrong after the check. The level sets the difficulty. */
export type CodeStatement = {
  text: string;
  correct: boolean;
  reason: string;
};

export type CodeTask = {
  id: string;
  level: Difficulty;
  language: "Python" | "SQL" | "TypeScript";
  question: string;
  code: string;
  statements: CodeStatement[];
};

export const CODE_TASKS: CodeTask[] = [
  {
    id: "orders",
    level: 1,
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
  {
    id: "innerhtml",
    level: 1,
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
    id: "eval-input",
    level: 1,
    language: "Python",
    question: "Welche Aussagen zu dieser Eingabe stimmen?",
    code: `value = eval(input("Zahl: "))
print(value * 2)`,
    statements: [
      {
        text: "Mit eval kann der Benutzer beliebigen Python-Code ausführen lassen.",
        correct: true,
        reason:
          "eval führt den eingegebenen Text als Python-Code aus. Wer etwas anderes eingibt, etwa einen Befehl zum Löschen von Dateien, führt ihn auf dem Rechner aus.",
      },
      {
        text: "Für eine Zahl ist int(input(...)) die sicherere Wahl.",
        correct: true,
        reason:
          "int wandelt nur Text in eine Zahl um und führt keinen Code aus. Eine ungültige Eingabe führt zu einem Fehler, nicht zu einer Ausführung.",
      },
      {
        text: "Die Zeile sollte einen Kommentar bekommen.",
        correct: false,
        reason:
          "Das ist eine Stilfrage. Es ist keine Schwachstelle im Sinne der Sicherheit.",
      },
    ],
  },
  {
    id: "print-secret",
    level: 1,
    language: "Python",
    question: "Welche Aussagen zu diesem Skript stimmen?",
    code: `API_KEY = "sk-123456"
print("Verbinde mit", API_KEY)`,
    statements: [
      {
        text: "Der Schlüssel steht im Klartext im Code und landet so in der Versionsverwaltung.",
        correct: true,
        reason:
          "Wer den Code kennt, kennt den Schlüssel. Geheimnisse gehören in Umgebungsvariablen oder einen Secret-Speicher.",
      },
      {
        text: "Der Schlüssel wird ausgegeben und kann so in Logdateien gelangen.",
        correct: true,
        reason:
          "Ausgaben landen oft in Logdateien, die viele Personen lesen können. Geheimnisse gehören nicht ins Log.",
      },
      {
        text: "Der Name API_KEY ist in Großbuchstaben geschrieben.",
        correct: false,
        reason:
          "Großbuchstaben sind die Konvention für Konstanten. Das ist keine Schwachstelle.",
      },
    ],
  },
  {
    id: "cors-all",
    level: 1,
    language: "TypeScript",
    question: "Welche Aussagen zu dieser Einstellung stimmen?",
    code: `app.use(cors({ origin: "*" }));`,
    statements: [
      {
        text: 'origin: "*" erlaubt jeder fremden Website den Zugriff auf die API.',
        correct: true,
        reason:
          "Jede Seite darf die Antworten der API im Browser des Besuchers lesen. Nur die Herkunft, die die API braucht, sollte erlaubt werden.",
      },
      {
        text: "Die Zeile sollte in eine eigene Datei ausgelagert werden.",
        correct: false,
        reason: "Das ist eine Stilfrage. Es ist keine Schwachstelle.",
      },
    ],
  },
  {
    id: "sql-injection",
    level: 2,
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
    level: 2,
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
    id: "file-read",
    level: 2,
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
    id: "debug-true",
    level: 2,
    language: "Python",
    question: "Welche Aussagen zu diesem Start des Servers stimmen?",
    code: `app = Flask(__name__)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)`,
    statements: [
      {
        text: "Im Debug-Modus zeigt der Server bei Fehlern interne Details, die Angreifern helfen.",
        correct: true,
        reason:
          "Die Fehlerseite zeigt Code, Pfade und Variablen. Der Debugger kann in manchen Fällen sogar Code ausführen lassen. Im Betrieb gehört debug=False.",
      },
      {
        text: 'Mit host="0.0.0.0" ist der Server im Netz für andere erreichbar.',
        correct: true,
        reason:
          "0.0.0.0 bedeutet: alle Netzwerkschnittstellen. Der Dienst ist dann auch für fremde Rechner erreichbar.",
      },
      {
        text: "Die Variable app wird nicht benutzt.",
        correct: false,
        reason:
          "app.run wird auf app aufgerufen, die Variable wird also benutzt. Das ist kein Fehler.",
      },
    ],
  },
  {
    id: "string-sql-delete",
    level: 2,
    language: "Python",
    question: "Welche Aussagen zu dieser Funktion stimmen?",
    code: `def clear_table(conn, table):
    conn.execute(f"DELETE FROM {table}")`,
    statements: [
      {
        text: "Der Tabellenname wird ungeprüft in den SQL-Befehl eingesetzt.",
        correct: true,
        reason:
          "Ein Name wie users; DROP TABLE orders kann beliebige Befehle einschleusen. Tabellennamen sollten gegen eine feste Liste geprüft werden.",
      },
      {
        text: "Die Funktion löscht alle Zeilen der übergebenen Tabelle.",
        correct: true,
        reason:
          "DELETE ohne WHERE entfernt jede Zeile. Das kann gewollt sein, ist aber bei falscher Eingabe gefährlich.",
      },
      {
        text: "Die Funktion gibt nichts zurück.",
        correct: false,
        reason: "Sie braucht nichts zurückzugeben. Das ist kein Fehler.",
      },
    ],
  },
  {
    id: "error-leak",
    level: 2,
    language: "TypeScript",
    question: "Welche Aussagen zu dieser Route stimmen?",
    code: `app.get("/user/:id", async (req, res) => {
  try {
    res.json(await db.findUser(req.params.id));
  } catch (err) {
    res.status(500).send(String(err));
  }
});`,
    statements: [
      {
        text: "Der Fehlertext wird an den Aufrufer geschickt und kann Details der Datenbank verraten.",
        correct: true,
        reason:
          "Fehlermeldungen nennen oft Tabellen, Spalten oder Pfade. Im Betrieb schreibt man sie ins Log und antwortet nur mit einer allgemeinen Meldung.",
      },
      {
        text: "Die Route nutzt die HTTP-Methode GET.",
        correct: false,
        reason: "Das stimmt und ist so gewollt. Es ist keine Schwachstelle.",
      },
    ],
  },
  {
    id: "unvalidated-redirect",
    level: 3,
    language: "TypeScript",
    question: "Welche Aussagen zu dieser Route stimmen?",
    code: `app.get("/go", (req, res) => {
  res.redirect(req.query.url as string);
});`,
    statements: [
      {
        text: "Ein Angreifer kann Nutzer über einen Link auf eine fremde Seite weiterleiten.",
        correct: true,
        reason:
          "Die Weiterleitung übernimmt die URL aus der Anfrage ungeprüft (Open Redirect). Ein Link auf die eigene Seite wirkt dann vertrauenswürdig, zielt aber woanders hin.",
      },
      {
        text: "Die Ziel-URL sollte gegen eine Liste erlaubter Ziele geprüft werden.",
        correct: true,
        reason:
          "Nur bekannte Ziele dürfen zugelassen werden. Alles andere wird abgelehnt oder auf eine Startseite umgeleitet.",
      },
      {
        text: "Die Route sollte /go heißen.",
        correct: false,
        reason:
          "Der Name der Route ist Geschmackssache. Er hat mit der Schwachstelle nichts zu tun.",
      },
    ],
  },
  {
    id: "insecure-random",
    level: 3,
    language: "Python",
    question: "Welche Aussagen zu dieser Funktion stimmen?",
    code: `import random

def reset_code():
    return str(random.randint(100000, 999999))`,
    statements: [
      {
        text: "random ist nicht für Sicherheit gedacht; für Reset-Codes gehört das Modul secrets.",
        correct: true,
        reason:
          "Die Werte von random sind vorhersagbar, wenn man einige davon kennt. Das Modul secrets erzeugt sichere Zufallswerte.",
      },
      {
        text: "Ein sechsstelliger Code hat nur eine Million Möglichkeiten und braucht eine Begrenzung der Versuche.",
        correct: true,
        reason:
          "Ohne Begrenzung kann ein Angreifer alle Codes nacheinander ausprobieren.",
      },
      {
        text: "Die Funktion gibt einen String zurück.",
        correct: false,
        reason: "Das ist korrekt und kein Fehler.",
      },
    ],
  },
  {
    id: "secret-compare",
    level: 3,
    language: "Python",
    question: "Welche Aussagen zu dieser Funktion stimmen?",
    code: `def check_token(given, expected):
    return given == expected`,
    statements: [
      {
        text: "Der Vergleich bricht beim ersten Unterschied ab, so lässt sich ein Token Zeichen für Zeichen erraten.",
        correct: true,
        reason:
          "Die Laufzeit verrät, wie viele Zeichen am Anfang stimmen (Timing-Angriff). hmac.compare_digest vergleicht in gleicher Zeit.",
      },
      {
        text: "Die Funktion gibt einen Booleschen Wert zurück.",
        correct: false,
        reason: "Das ist korrekt und kein Fehler.",
      },
    ],
  },
  {
    id: "weak-hash",
    level: 3,
    language: "Python",
    question: "Welche Aussagen zu dieser Funktion stimmen?",
    code: `import hashlib

def store_password(pw):
    return hashlib.md5(pw.encode()).hexdigest()`,
    statements: [
      {
        text: "MD5 ist für Passwörter zu schnell und gilt als gebrochen.",
        correct: true,
        reason:
          "Schnelle Verfahren lassen sich leicht durchprobieren. Für Passwörter nimmt man ein langsames Verfahren wie bcrypt oder argon2.",
      },
      {
        text: "Ohne Salz erkennt man gleiche Passwörter an gleichen Hashes.",
        correct: true,
        reason:
          "Ein Salz pro Benutzer verhindert vorberechnete Tabellen (Rainbow Tables) und macht gleiche Passwörter unterscheidbar.",
      },
      {
        text: "Die Funktion gibt einen Hex-String zurück.",
        correct: false,
        reason:
          "Das stimmt, und es ist kein Fehler. Der Hex-String ist nur eine Darstellung des Hashes.",
      },
    ],
  },
  {
    id: "missing-auth",
    level: 3,
    language: "TypeScript",
    question: "Welche Aussagen zu dieser Route stimmen?",
    code: `app.delete("/users/:id", async (req, res) => {
  await db.deleteUser(req.params.id);
  res.sendStatus(204);
});`,
    statements: [
      {
        text: "Jeder, der die Route aufrufen kann, kann beliebige Benutzer löschen.",
        correct: true,
        reason:
          "Es gibt keine Prüfung, wer angemeldet ist und ob er Rechte hat. Das nennt man fehlende Autorisierung.",
      },
      {
        text: "Die Eingabe req.params.id sollte geprüft werden, bevor sie an die Datenbank geht.",
        correct: true,
        reason:
          "Ungeprüfte Eingaben können unerwartete Werte in die Datenbank bringen. Eine Prüfung auf das erwartete Format ist der übliche Schutz.",
      },
      {
        text: "sendStatus(204) ist ein Fehler, weil kein Inhalt zurückkommt.",
        correct: false,
        reason:
          "204 bedeutet: erfolgreich, ohne Inhalt. Das ist hier richtig so.",
      },
    ],
  },
];

/* The tasks of one level, in the order of the game. */
export function codeTasksOf(level: Difficulty): CodeTask[] {
  return CODE_TASKS.filter((task) => task.level === level);
}

/* A task is solved when exactly the right statements are marked. */
export function isTaskSolved(
  task: CodeTask,
  marked: readonly number[],
): boolean {
  return task.statements.every(
    (statement, index) => statement.correct === marked.includes(index),
  );
}
