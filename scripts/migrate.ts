// Applies the SQL migration files in drizzle/*.sql to data/salao.db using
// Node's built-in `node:sqlite` module — no native module compilation
// required (unlike `drizzle-kit push`, which needs better-sqlite3 or a
// similar compiled driver installed to talk to the database).
//
// This is also run automatically on every server boot (see
// src/db/index.ts), so this script mostly exists for running the migration
// explicitly/manually — e.g. as a one-off before the app has ever started.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { applyMigrations } from "../src/db/apply-migrations";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "salao.db");
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON");

const appliedCount = applyMigrations(db, (msg) => console.log(msg));

if (appliedCount === 0) {
  console.log("Banco de dados já está atualizado — nenhuma migração pendente.");
} else {
  console.log(`\n${appliedCount} migração(ões) aplicada(s) com sucesso em ${dbPath}`);
}

db.close();
