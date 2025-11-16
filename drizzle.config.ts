import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// .env.localを読み込む
config({ path: ".env.local" });

// DATABASE_URLの取得
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not defined in .env.local");
  }
  return dbUrl;
};

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
