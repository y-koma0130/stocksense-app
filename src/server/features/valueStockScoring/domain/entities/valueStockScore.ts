import { z } from "zod";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";
import { type TotalScore, totalScoreSchema } from "../values/totalScore";

/**
 * 割安株スコア集約のZodスキーマ
 */
export const valueStockScoreSchema = z.object({
  perScore: indicatorScoreSchema,
  pbrScore: indicatorScoreSchema,
  rsiScore: indicatorScoreSchema,
  priceRangeScore: indicatorScoreSchema,
  sectorScore: z.number(), // 0.00〜100.00 (将来の業種トレンドスコア用)
  totalScore: totalScoreSchema, // 0.0000〜1.0000
});

/**
 * 割安株スコア集約の型定義
 */
export type ValueStockScore = z.infer<typeof valueStockScoreSchema>;

/**
 * 割安株スコア集約を生成する
 */
export type CreateValueStockScore = (input: {
  perScore: IndicatorScore;
  pbrScore: IndicatorScore;
  rsiScore: IndicatorScore;
  priceRangeScore: IndicatorScore;
  sectorScore: number;
  totalScore: TotalScore;
}) => ValueStockScore;

export const createValueStockScore: CreateValueStockScore = (input) => {
  return valueStockScoreSchema.parse(input);
};
