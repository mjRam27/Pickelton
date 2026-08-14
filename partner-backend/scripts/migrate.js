import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pool } from "../src/config/database.js";

await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
for (const name of (await readdir(resolve("migrations"))).filter((file)=>file.endsWith(".sql")).sort()) {
  const exists=await pool.query("SELECT 1 FROM schema_migrations WHERE name=$1",[name]); if(exists.rowCount) continue;
  const sql=await readFile(resolve("migrations",name),"utf8"); const client=await pool.connect();
  try{await client.query("BEGIN");await client.query(sql);await client.query("INSERT INTO schema_migrations(name) VALUES($1)",[name]);await client.query("COMMIT");console.log(`Applied ${name}`);}catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
}
await pool.end();
