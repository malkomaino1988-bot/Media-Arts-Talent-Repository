import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

export const hasDatabase = Boolean(process.env.DATABASE_URL);
export const pool = hasDatabase ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
const runtimeDb = hasDatabase && pool ? drizzle(pool, { schema }) : null;
export const db = runtimeDb as NonNullable<typeof runtimeDb>;

export * from "./schema";
