import * as path from 'node:path';
import Database from 'better-sqlite3';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'lotty.db');

export type ApplicationData = {
  names: string[];
  history: string[];
}

export const loadData = (): ApplicationData => {
  const names = (db.prepare('SELECT name FROM names ORDER BY id').all() as { name: string }[]).map(r => r.name);
  const history = (db.prepare('SELECT name FROM history ORDER BY id').all() as { name: string }[]).map(r => r.name);
  return { names, history };
}

export const saveData = (data: ApplicationData) => {
  db.transaction(() => {
    db.prepare('DELETE FROM names').run();
    db.prepare('DELETE FROM history').run()

    for (const name of data.names) {
      db.prepare('INSERT OR IGNORE INTO names (name) VALUES (?)').run(name);
    }
    for (const name of data.history) {
      db.prepare('INSERT OR IGNORE INTO history (name) VALUES (?)').run(name);
    }
  })();
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS names (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS history (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL UNIQUE
  );
`);

