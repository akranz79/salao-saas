import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as dbSchema from "./schema";
import { applyMigrations } from "./apply-migrations";
import path from "node:path";
import fs from "node:fs";

// We deliberately avoid any native (compiled) sqlite driver such as
// better-sqlite3 here. Native modules need a matching prebuilt binary or a
// full C++ toolchain to compile from source, which is a common source of
// broken `npm install` on Windows (missing Visual Studio Build Tools,
// mismatched Node ABI, etc.). `node:sqlite` ships inside Node.js itself
// (stable since Node 22.5+), so there is nothing to compile or download —
// `npm install` only ever installs pure JavaScript here.
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new DatabaseSync(path.join(dataDir, "salao.db"));
sqlite.exec("PRAGMA journal_mode = WAL");
sqlite.exec("PRAGMA foreign_keys = ON");

// Apply any pending migrations every time the server process actually boots
// to serve traffic. This is what `npm run db:migrate` does too, but running
// it here as well means the schema always exists regardless of whether a
// given hosting platform actually honors a custom start command.
//
// We deliberately skip this during `next build`: Next.js's "Collecting page
// data" step imports every route/layout module (this one included) across
// up to dozens of parallel worker processes just to statically analyze
// them — none of them actually run real queries at build time, so there's
// nothing to migrate for yet, and doing it anyway means many processes
// racing to create the same tables in the same (throwaway, build-local)
// sqlite file at once. Next sets NEXT_PHASE=phase-production-build on
// process.env for exactly this kind of build-vs-runtime check, and worker
// processes inherit it.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (!isBuildPhase) {
  applyMigrations(sqlite, (msg) => console.log(`[db] ${msg}`));
}

// drizzle's sqlite-proxy driver expects rows as plain arrays of values in
// column order (not objects keyed by column name) — this mirrors how
// lower-level sqlite drivers hand rows back before drizzle maps them onto
// the schema's field list.
function rowToArray(row: Record<string, unknown>): unknown[] {
  return Object.values(row);
}

export const db = drizzle(
  async (sqlText, params, method) => {
    const stmt = sqlite.prepare(sqlText);

    if (method === "run") {
      stmt.run(...params);
      return { rows: [] };
    }

    if (method === "get") {
      const row = stmt.get(...params) as Record<string, unknown> | undefined;
      return { rows: (row ? rowToArray(row) : undefined) as unknown[] };
    }

    // "all" and "values"
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return { rows: rows.map(rowToArray) };
  },
  { schema: dbSchema }
);

export * as schema from "./schema";
