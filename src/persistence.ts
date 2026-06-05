import * as fs from 'node:fs';
import * as path from 'node:path';
import Database from 'better-sqlite3';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'lotty.db');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS names (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    interaction_id  TEXT NOT NULL,
    name            TEXT NOT NULL,
    UNIQUE(interaction_id, name)
  );
  CREATE TABLE IF NOT EXISTS history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    interaction_id  TEXT NOT NULL,
    name            TEXT NOT NULL,
    UNIQUE(interaction_id, name)
  );
`);

export type ApplicationData = {
  names: string[];
  history: string[];
};

export const loadData = (interactionId: string): ApplicationData => {
  const names = (db.prepare('SELECT name FROM names WHERE interaction_id = ? ORDER BY id').all(interactionId) as { name: string }[]).map(r => r.name);
  const history = (db.prepare('SELECT name FROM history WHERE interaction_id = ? ORDER BY id').all(interactionId) as { name: string }[]).map(r => r.name);
  return { names, history };
};

export const saveData = (interactionId: string, data: ApplicationData): void => {
  db.transaction(() => {
    db.prepare('DELETE FROM names WHERE interaction_id = ?').run(interactionId);
    db.prepare('DELETE FROM history WHERE interaction_id = ?').run(interactionId);
    for (const name of data.names) {
      db.prepare('INSERT OR IGNORE INTO names (interaction_id, name) VALUES (?, ?)').run(interactionId, name);
    }
    for (const name of data.history) {
      db.prepare('INSERT OR IGNORE INTO history (interaction_id, name) VALUES (?, ?)').run(interactionId, name);
    }
  })();
};

export const insertHistory = (interactionId: string, name: string): void => {
  db.prepare('INSERT OR IGNORE INTO history (interaction_id, name) VALUES (?, ?)').run(interactionId, name);
};

export const clearHistory = (interactionId: string): void => {
  db.prepare('DELETE FROM history WHERE interaction_id = ?').run(interactionId);
};

export const insertName = (interactionId: string, name: string): void => {
  db.prepare('INSERT OR IGNORE INTO names (interaction_id, name) VALUES (?, ?)').run(interactionId, name);
};

export const deleteName = (interactionId: string, name: string): void => {
  db.prepare('DELETE FROM names WHERE interaction_id = ? AND name = ?').run(interactionId, name);
  db.prepare('DELETE FROM history WHERE interaction_id = ? AND name = ?').run(interactionId, name);
};
