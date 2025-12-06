import { z } from "zod";
import { periodTypeSchema } from "@/constants/periodTypes";
import { valueStockScoreSchema } from "../../domain/entities/valueStockScore";

/**
 * 共通の指標DTOベーススキーマ
 *
 * TODO: 中期/長期で扱う指標が異なってきたため、将来的に以下の分離を検討:
 * - baseIndicatorDtoSchema を廃止し、中期/長期で完全に独立したスキーマを定義
 * - MidTermIndicatorDto / LongTermIndicatorDto を別ファイルに分離
 * - discriminated union を使わず、ユースケース層で明示的に型を分ける
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
 * rsiShort: 短期RSI（2週）- RSIモメンタム計算用
 * avgVolumeShort, avgVolumeLong: 出来高指標 - 罠株除外・スコアリング用
 * epsLatest, eps3yAgo: EPS成長率計算用（グロース市場のみ使用）
 * macroTagIds, themeTagIds: タグスコア計算用（グロース市場のみ使用）
 */
export const midTermIndicatorDtoSchema = baseIndicatorDtoSchema.extend({
  periodType: z.literal("mid_term"),
  rsiShort: z.number().nullable(), // 短期RSI（2週）- モメンタム計算用
  avgVolumeShort: z.number().nullable(), // 短期平均出来高
  avgVolumeLong: z.number().nullable(), // 長期平均出来高
  epsLatest: z.number().nullable(), // 最新年度のEPS（グロース市場のみ）
  eps3yAgo: z.number().nullable(), // 3年前のEPS（グロース市場のみ）
  macroTagIds: z.array(z.string()), // マクロタグID配列
  themeTagIds: z.array(z.string()), // テーマタグID配列
});

/**
 * 長期指標DTOスキーマ
 * avgVolumeShort: 出来高指標 - 罠株除外用
 * epsLatest, eps3yAgo: EPS成長率計算用（長期スコアリング用）
 * macroTagIds, themeTagIds: タグスコア計算用（全市場で使用）
 */
export const longTermIndicatorDtoSchema = baseIndicatorDtoSchema.extend({
  periodType: z.literal("long_term"),
  avgVolumeShort: z.number().nullable(), // 短期平均出来高（罠株除外用）
  epsLatest: z.number().nullable(), // 最新年度のEPS
  eps3yAgo: z.number().nullable(), // 3年前のEPS
  macroTagIds: z.array(z.string()), // マクロタグID配列
  themeTagIds: z.array(z.string()), // テーマタグID配列
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
  valueScore: valueStockScoreSchema,
});

/**
 * スコア付き銘柄指標DTO型
 */
export type ValueStockDto = z.infer<typeof valueStockDtoSchema>;
