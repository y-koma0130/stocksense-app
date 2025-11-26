import { z } from "zod";
import { valueScoreSchema } from "../../domain/services/calculateValueScore.service";
import { periodTypeSchema } from "../../domain/values/periodType";

/**
 * 共通の指標DTOベーススキーマ
 */
const baseIndicatorDtoSchema = z.object({
  stockId: z.string(),
  tickerCode: z.string(),
  tickerSymbol: z.string(),
  name: z.string(),
  sectorCode: z.string().nullable(),
  sectorName: z.string().nullable(),
  market: z.string().nullable(),
  collectedAt: z.string(),

  // 財務指標
  currentPrice: z.number().nullable(),
  per: z.number().nullable(),
  pbr: z.number().nullable(),

  // テクニカル指標
  rsi: z.number().nullable(),

  // 価格レンジ指標
  priceHigh: z.number().nullable(),
  priceLow: z.number().nullable(),

  // 業種平均（JOIN取得）
  sectorAvgPer: z.number().nullable(),
  sectorAvgPbr: z.number().nullable(),

  // 財務健全性指標（罠銘柄除外用、JOIN取得）
  equityRatio: z.number().nullable(),
  roe: z.number().nullable(),
  operatingIncomeDeclineYears: z.number().nullable(),
  operatingCashFlowNegativeYears: z.number().nullable(),
  revenueDeclineYears: z.number().nullable(),
});

/**
 * 中期指標DTOスキーマ
 */
export const midTermIndicatorDtoSchema = baseIndicatorDtoSchema.extend({
  periodType: z.literal("mid_term"),
});

/**
 * 長期指標DTOスキーマ
 */
export const longTermIndicatorDtoSchema = baseIndicatorDtoSchema.extend({
  periodType: z.literal("long_term"),
});

/**
 * 統合指標DTOスキーマ（中期 or 長期）
 */
export const indicatorDtoSchema = z.discriminatedUnion("periodType", [
  midTermIndicatorDtoSchema,
  longTermIndicatorDtoSchema,
]);

/**
 * 指標DTO型
 */
export type IndicatorDto = z.infer<typeof indicatorDtoSchema>;
export type MidTermIndicatorDto = z.infer<typeof midTermIndicatorDtoSchema>;
export type LongTermIndicatorDto = z.infer<typeof longTermIndicatorDtoSchema>;

/**
 * スコア付き銘柄指標DTOスキーマ
 */
export const valueStockDtoSchema = baseIndicatorDtoSchema.extend({
  periodType: periodTypeSchema,
  valueScore: valueScoreSchema,
});

/**
 * スコア付き銘柄指標DTO型
 */
export type ValueStockDto = z.infer<typeof valueStockDtoSchema>;
