import { z } from "zod";
import { indicatorScoreSchema } from "../values/indicatorScore";
import { sectorScoreSchema } from "../values/sectorScore";
import { totalScoreSchema } from "../values/totalScore";

/**
 * 割安株スコア集約のZodスキーマ
 */
export const valueStockScoreSchema = z.object({
  perScore: indicatorScoreSchema,
  pbrScore: indicatorScoreSchema,
  rsiScore: indicatorScoreSchema,
  priceRangeScore: indicatorScoreSchema,
  sectorScore: sectorScoreSchema,
  totalScore: totalScoreSchema,
});

/**
 * 割安株スコア集約の型定義
 */
export type ValueStockScore = z.infer<typeof valueStockScoreSchema>;
