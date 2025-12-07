import { z } from "zod";

/**
 * 個別指標スコアのZodスキーマ（0〜100の連続値）
 */
export const indicatorScoreSchema = z.number().min(0).max(100).brand<"IndicatorScore">();

export type IndicatorScore = z.infer<typeof indicatorScoreSchema>;
