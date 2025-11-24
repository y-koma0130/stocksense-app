import { z } from "zod";

/**
 * データ基準日（YYYY-MM-DD形式）の値オブジェクト
 */
export const dataDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Data date must be in YYYY-MM-DD format",
});

export type DataDate = z.infer<typeof dataDateSchema>;
