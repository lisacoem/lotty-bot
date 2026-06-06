import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 5,
});

export async function initDb(): Promise<void> {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS names (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      interaction_id  VARCHAR(32) NOT NULL,
      name            VARCHAR(255) NOT NULL,
      UNIQUE KEY uq_guild_name (interaction_id, name)
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS history (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      interaction_id  VARCHAR(32) NOT NULL,
      name            VARCHAR(255) NOT NULL,
      UNIQUE KEY uq_guild_name (interaction_id, name)
    )
  `);
}

export type ApplicationData = {
  names: string[];
  history: string[];
};

export async function loadData(interactionId: string): Promise<ApplicationData> {
  const [names] = await pool.execute<mysql.RowDataPacket[]>('SELECT name FROM names WHERE interaction_id = ? ORDER BY id', [interactionId]);
  const [history] = await pool.execute<mysql.RowDataPacket[]>('SELECT name FROM history WHERE interaction_id = ? ORDER BY id', [interactionId]);
  return {
    names: names.map((row) => row.name),
    history: history.map((row) => row.name),
  };
}

export async function saveData(interactionId: string, data: ApplicationData): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM names WHERE interaction_id = ?', [interactionId]);
    await connection.execute('DELETE FROM history WHERE interaction_id = ?', [interactionId]);
    for (const name of data.names) {
      await connection.execute('INSERT IGNORE INTO names s(interaction_id, name) VALUES (?, ?)', [interactionId, name]);
    }
    for (const name of data.history) {
      await connection.execute('INSERT IGNORE INTO history (interaction_id, name) VALUES (?, ?)', [interactionId, name]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function insertHistory(interactionId: string, name: string): Promise<void> {
  await pool.execute('INSERT IGNORE INTO history (interaction_id, name) VALUES (?, ?)', [interactionId, name]);
}

export async function clearHistory(interactionId: string): Promise<void> {
  await pool.execute('DELETE FROM history WHERE interaction_id = ?', [interactionId]);
}

export async function insertName(interactionId: string, name: string): Promise<void> {
  await pool.execute('INSERT IGNORE INTO names (interaction_id, name) VALUES (?, ?)', [interactionId, name]);
}

export async function deleteName(guildId: string, name: string): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM names   WHERE interaction_id = ? AND name = ?', [guildId, name]);
    await conn.execute('DELETE FROM history WHERE interaction_id = ? AND name = ?', [guildId, name]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
