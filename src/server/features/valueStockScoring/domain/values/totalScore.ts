import { z } from "zod";

/**
 * 総合スコアのZodスキーマ（0.0000〜1.0000）
 */
export const totalScoreSchema = z.number().min(0).max(1).brand<"TotalScore">();

export type TotalScore = z.infer<typeof totalScoreSchema>;
