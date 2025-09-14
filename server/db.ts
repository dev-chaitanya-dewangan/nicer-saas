import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import ws from "ws";
import * as schema from "@shared/schema";
import * as schemaSqlite from "@shared/schema-sqlite";
import { join } from "path";

// Use SQLite for development, PostgreSQL for production
const isDevelopment = process.env.NODE_ENV === "development";

let db: any;
let pool: any = null;

if (isDevelopment) {
  // SQLite for development
  const dbPath = join(process.cwd(), "dev.db");
  const sqlite = new Database(dbPath);
  db = drizzleSqlite({ client: sqlite, schema: schemaSqlite });
  pool = null; // Not used in SQLite mode
} else {
  // PostgreSQL for production
  neonConfig.webSocketConstructor = ws;

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }

  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
}

export { db, pool };
