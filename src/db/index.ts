import { config } from "dotenv";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: ".env.local" });

let dbInstance: PostgresJsDatabase<Record<string, never>> | null = null;

/**
 * データベース接続を取得する
 * ビルド時にエラーを防ぐため、遅延初期化を採用
 */
const getDb = (): PostgresJsDatabase<Record<string, never>> => {
  if (dbInstance) {
    return dbInstance;
  }

  // DATABASE_URLを取得（未設定の場合はエラー）
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  // ローカル環境かどうかを判定
  const isLocal = databaseUrl.includes("127.0.0.1") || databaseUrl.includes("localhost");

  // Supabaseの接続プールでは prepare: false が必要
  const client = postgres(databaseUrl, {
    prepare: false,
    ssl: isLocal ? false : "require",
  });

  dbInstance = drizzle(client);
  return dbInstance;
};

export const db = new Proxy({} as PostgresJsDatabase<Record<string, never>>, {
  get(_, prop) {
    return getDb()[prop as keyof PostgresJsDatabase<Record<string, never>>];
  },
});
