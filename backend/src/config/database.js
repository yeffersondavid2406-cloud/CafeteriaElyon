import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = new URL(process.env.DATABASE_URL);

console.log("🔎 DB USER:", dbUrl.username);
console.log("🔎 DB HOST:", dbUrl.hostname);
console.log("🔎 DB PORT:", dbUrl.port);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("✅ Conectado a Supabase PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error en PostgreSQL:", err);
});

export default pool;