import { z } from "zod";

/**
 * スコアリング入力エンティティ（永続化しない中間データ）
 *
 * スコア計算に必要な株式データをまとめたエンティティ。
 * 計算処理の入力として使用され、永続化はされない。
 */
export const scoringInputSchema = z.object({
  tickerSymbol: z.string(),
  stockId: z.string(),
  currentPrice: z.number().positive("Current price must be positive"),
  per: z.number().nullable(),
  pbr: z.number().nullable(),
  rsi: z.number().nullable(),
  fiftyTwoWeekHigh: z.number(),
  fiftyTwoWeekLow: z.number(),
  sectorCode: z.string().nullable(),
  sectorAvgPer: z.number().nullable(),
  sectorAvgPbr: z.number().nullable(),
});

export type ScoringInput = z.infer<typeof scoringInputSchema>;

/**
 * スコアリング入力エンティティを生成（バリデーション付き）
 */
export const createScoringInput = (rawInput: unknown): ScoringInput => {
  return scoringInputSchema.parse(rawInput);
};
