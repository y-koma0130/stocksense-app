import { z } from "zod";
import { valueStockScoreSchema } from "../../domain/entities/valueStockScore";
import { longTermIndicatorDtoSchema } from "./longTermIndicator.dto";
import { midTermIndicatorDtoSchema } from "./midTermIndicator.dto";

/**
 * 中期スコア付き銘柄指標DTOスキーマ
 */
export const midTermValueStockDtoSchema = midTermIndicatorDtoSchema.extend({
  valueScore: valueStockScoreSchema,
});

/**
 * 長期スコア付き銘柄指標DTOスキーマ
 */
export const longTermValueStockDtoSchema = longTermIndicatorDtoSchema.extend({
  valueScore: valueStockScoreSchema,
});

/**
 * 中期スコア付き銘柄指標DTO型
 */
export type MidTermValueStockDto = z.infer<typeof midTermValueStockDtoSchema>;

/**
 * 長期スコア付き銘柄指標DTO型
 */
export type LongTermValueStockDto = z.infer<typeof longTermValueStockDtoSchema>;

/**
 * スコア付き銘柄指標DTO統合スキーマ（中期 or 長期）
 * フロントエンド等で両方の型を扱う場合に使用
 */
export const valueStockDtoSchema = z.discriminatedUnion("periodType", [
  midTermValueStockDtoSchema,
  longTermValueStockDtoSchema,
]);

/**
 * スコア付き銘柄指標DTO型（中期 or 長期）
 * フロントエンド等で両方の型を扱う場合に使用
 */
export type ValueStockDto = z.infer<typeof valueStockDtoSchema>;
