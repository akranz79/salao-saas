import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as dbSchema from "./schema";
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
