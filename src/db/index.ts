import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * Supabase Transaction pool mode用の接続設定
 * prepare: false を指定して prepared statements を無効化
 */
const client = postgres(process.env.DATABASE_URL, {
	prepare: false,
});

export const db = drizzle({ client, schema });
