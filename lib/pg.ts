import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    // Safe debug: log only host, port, and sslmode (mask user/pass)
    try {
      const u = new URL(connectionString);
      const sslMode = u.searchParams.get("sslmode") || "(none)";
      console.log(
        `[DB] Initializing pool -> host: ${u.hostname}, port: ${u.port || "5432"}, db: ${u.pathname.replace("/", "")}, sslmode: ${sslMode}`
      );
    } catch {
      console.warn("[DB] DATABASE_URL could not be parsed as URL. Using as-is.");
    }
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}
