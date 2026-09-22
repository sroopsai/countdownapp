import { neon } from "@neondatabase/serverless";
import { CountdownEvent } from "@/types/countdown";

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

let tableInitialized = false;

export async function ensureTableExists(): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;
  if (tableInitialized) return true;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS countdown_events (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        target_date TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        notes TEXT
      );
    `;
    tableInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize database table:", error);
    return false;
  }
}

export async function saveEventToDb(event: CountdownEvent): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  await ensureTableExists();

  try {
    await sql`
      INSERT INTO countdown_events (id, title, target_date, created_at, notes)
      VALUES (
        ${event.id},
        ${event.title},
        ${event.targetDate},
        ${event.createdAt},
        ${event.notes || null}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        target_date = EXCLUDED.target_date,
        notes = EXCLUDED.notes;
    `;
    return true;
  } catch (error) {
    console.error("Failed to save event to Neon:", error);
    return false;
  }
}

export async function getEventFromDb(id: string): Promise<CountdownEvent | null> {
  const sql = getDb();
  if (!sql) return null;

  await ensureTableExists();

  try {
    const rows = await sql`
      SELECT id, title, target_date, created_at, notes
      FROM countdown_events
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      targetDate: new Date(row.target_date).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
      notes: row.notes || undefined,
    };
  } catch (error) {
    console.error("Failed to fetch event from Neon:", error);
    return null;
  }
}

export async function getRecentEventsFromDb(limit: number = 20): Promise<CountdownEvent[]> {
  const sql = getDb();
  if (!sql) return [];

  await ensureTableExists();

  try {
    const rows = await sql`
      SELECT id, title, target_date, created_at, notes
      FROM countdown_events
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      targetDate: new Date(row.target_date).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
      notes: row.notes || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch recent events from Neon:", error);
    return [];
  }
}

export async function deleteEventFromDb(id: string): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      DELETE FROM countdown_events
      WHERE id = ${id};
    `;
    return true;
  } catch (error) {
    console.error("Failed to delete event from Neon:", error);
    return false;
  }
}
