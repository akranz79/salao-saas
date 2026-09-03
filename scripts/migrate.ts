// Applies the SQL migration files in drizzle/*.sql to data/salao.db using
// Node's built-in `node:sqlite` module — no native module compilation
// required (unlike `drizzle-kit push`, which needs better-sqlite3 or a
// similar compiled driver installed to talk to the database).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "salao.db");
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS __migrations (
    name TEXT PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (current_timestamp)
  )
`);

const migrationsDir = path.join(process.cwd(), "drizzle");
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const applied = new Set(
  db
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

  console.log(`Aplicando migração ${file} (${statements.length} comando(s))...`);
  for (const statement of statements) {
    db.exec(statement);
  }
  db.prepare("INSERT INTO __migrations (name) VALUES (?)").run(file);
  appliedCount++;
}

if (appliedCount === 0) {
  console.log("Banco de dados já está atualizado — nenhuma migração pendente.");
} else {
  console.log(`\n${appliedCount} migração(ões) aplicada(s) com sucesso em ${dbPath}`);
}

db.close();
