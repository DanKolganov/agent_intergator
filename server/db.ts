import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL!; 

const client = postgres(connectionString, { 
  ssl: 'require'  // или { rejectUnauthorized: true } для проверки
});

export const db = drizzle(client);

// Configure SSL handling for environments where the server's TLS chain
// includes an untrusted/self-signed certificate (e.g. some managed poolers).
// By default we let node-postgres verify the certificate. To disable
// verification (NOT recommended for general use) set either:
// - PGSSLMODE=no-verify  OR
// - DB_SSL_NO_VERIFY=true
// This will set `ssl.rejectUnauthorized = false` for the PG pool.


// const poolConfig: any = { connectionString: process.env.DATABASE_URL };
// const noVerify =
//   (process.env.PGSSLMODE || "").toLowerCase() === "no-verify" ||
//   (process.env.DB_SSL_NO_VERIFY || "").toLowerCase() === "true";

// if (noVerify) {
//   poolConfig.ssl = { rejectUnauthorized: false };
// }

// export const pool = new Pool(poolConfig);
// export const db = drizzle(pool, { schema });