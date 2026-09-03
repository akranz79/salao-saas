import type { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// Applies any pending SQL files from drizzle/*.sql to the given database.
// Shared by scripts/migrate.ts (manual/CLI use) and src/db/index.ts (run
// automatically on every server boot) so the schema is guaranteed to exist
// no matter which command a hosting platform actually runs on startup —
// deploy platforms are not always configured the way you expect, and a
// "no such table" error in production is a lot harder to see coming than
// a redundant, idempotent migration check on every boot.
export function applyMigrations(sqlite: DatabaseSync, log: (msg: string) => void = () => {}) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (current_timestamp)
    )
  `);

  const migrationsDir = path.join(process.cwd(), "drizzle");
  if (!fs.existsSync(migrationsDir)) {
    log(`Aviso: pasta de migrações "${migrationsDir}" não encontrada — nada a aplicar.`);
    return 0;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = new Set(
    sqlite
      .prepare("SELECT name FROM __migrations")
      .all()
      .map((r: any) => r.name as string)
  );

  let appliedCount = 0;
  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    log(`Aplicando migração ${file} (${statements.length} comando(s))...`);
    for (const statement of statements) {
      sqlite.exec(statement);
    }
    sqlite.prepare("INSERT INTO __migrations (name) VALUES (?)").run(file);
    appliedCount++;
  }

  return appliedCount;
}
