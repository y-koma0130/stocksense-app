import { z } from "zod";
import type { ScoringInput } from "../entities/scoringInput";

/**
 * 株式スコア集約ルート（永続化対象）
 *
 * スコアリング結果を表す集約ルート。
 * データベースに永続化され、APIを通じてクライアントに提供される。
 */
export const stockScoreSchema = z.object({
  stockId: z.string(),
  tickerSymbol: z.string(),
  scoreType: z.enum(["mid_term", "long_term"]),
  perScore: z.number().min(0).max(100),
  pbrScore: z.number().min(0).max(100),
  rsiScore: z.number().min(0).max(100),
  priceRangeScore: z.number().min(0).max(100),
  sectorScore: z.number().min(0).max(100),
  totalScore: z.number().min(0).max(1),
});

export type StockScore = z.infer<typeof stockScoreSchema>;

/**
 * 株式スコア集約を生成（バリデーション付き）
 */
export const createStockScore = (
  input: ScoringInput,
  scores: {
    perScore: number;
    pbrScore: number;
    rsiScore: number;
    priceRangeScore: number;
    sectorScore: number;
    totalScore: number;
  },
  scoreType: "mid_term" | "long_term",
): StockScore => {
  return stockScoreSchema.parse({
    stockId: input.stockId,
    tickerSymbol: input.tickerSymbol,
    scoreType,
    ...scores,
  });
};
