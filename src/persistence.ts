import * as fs from 'node:fs';
import * as path from 'node:path';
import Database from 'better-sqlite3';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'lotty.db');

const dbDir = path.dirname(DB_PATH);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS names (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    interaction_id  TEXT NOT NULL,
    name            TEXT NOT NULL,
    is_timeout      INTEGER NOT NULL DEFAULT 0,
    UNIQUE(interaction_id, name)
  );
  CREATE TABLE IF NOT EXISTS history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    interaction_id  TEXT NOT NULL,
    name            TEXT NOT NULL,
    UNIQUE(interaction_id, name)
  );
`);

const nameColumns = db.prepare(`PRAGMA table_info(names)`).all() as { name: string }[];
if (!nameColumns.some(c => c.name === 'is_timeout')) {
  db.exec(`ALTER TABLE names ADD COLUMN is_timeout INTEGER NOT NULL DEFAULT 0`);
}

export type ApplicationData = {
  names: string[];
  history: string[];
};

export type NameEntry = {
  name: string;
  isTimeout: boolean;
};

export function loadData(interactionId: string): ApplicationData {
  const names = (
    db.prepare('SELECT name FROM names WHERE interaction_id = ? AND is_timeout = 0 ORDER BY id')
      .all(interactionId) as { name: string }[]
  ).map(r => r.name);
  const history = (
    db.prepare('SELECT name FROM history WHERE interaction_id = ? ORDER BY id')
      .all(interactionId) as { name: string }[]
  ).map(r => r.name);
  return { names, history };
}

export function loadAllNames(interactionId: string): NameEntry[] {
  const rows = db.prepare('SELECT name, is_timeout FROM names WHERE interaction_id = ? ORDER BY id')
    .all(interactionId) as { name: string; is_timeout: number }[];
  return rows.map(r => ({ name: r.name, isTimeout: !!r.is_timeout }));
}

export function saveData(interactionId: string, data: ApplicationData): void {
  db.transaction(() => {
    db.prepare('DELETE FROM names   WHERE interaction_id = ?').run(interactionId);
    db.prepare('DELETE FROM history WHERE interaction_id = ?').run(interactionId);
    for (const name of data.names) {
      db.prepare('INSERT OR IGNORE INTO names   (interaction_id, name) VALUES (?, ?)').run(interactionId, name);
    }
    for (const name of data.history) {
      db.prepare('INSERT OR IGNORE INTO history (interaction_id, name) VALUES (?, ?)').run(interactionId, name);
    }
  })();
}

export function insertHistory(interactionId: string, name: string): void {
  db.prepare('INSERT OR IGNORE INTO history (interaction_id, name) VALUES (?, ?)').run(interactionId, name);
}

export function clearHistory(interactionId: string): void {
  db.prepare('DELETE FROM history WHERE interaction_id = ?').run(interactionId);
}

export function restoreHistory(interactionId: string, names: string[]): void {
  db.transaction(() => {
    db.prepare('DELETE FROM history WHERE interaction_id = ?').run(interactionId);
    for (const name of names) {
      db.prepare('INSERT OR IGNORE INTO history (interaction_id, name) VALUES (?, ?)').run(interactionId, name);
    }
  })();
}

export function insertName(interactionId: string, name: string): void {
  db.prepare('INSERT OR IGNORE INTO names (interaction_id, name) VALUES (?, ?)').run(interactionId, name);
}

export function deleteName(interactionId: string, name: string): void {
  db.transaction(() => {
    db.prepare('DELETE FROM names   WHERE interaction_id = ? AND name = ?').run(interactionId, name);
    db.prepare('DELETE FROM history WHERE interaction_id = ? AND name = ?').run(interactionId, name);
  })();
}

export function sendToTimeout(interactionId: string, name: string): void {
  const result = db.prepare('UPDATE names SET is_timeout = 1 WHERE interaction_id = ? AND name = ?').run(interactionId, name);
  if (result.changes === 0) {
    throw new Error(`Name "${name}" not found`);
  }
}

export function removeFromTimeout(interactionId: string, name: string): void {
  const result = db.prepare('UPDATE names SET is_timeout = 0 WHERE interaction_id = ? AND name = ?').run(interactionId, name);
  if (result.changes === 0) {
    throw new Error(`Name "${name}" not found`);
  }
}
