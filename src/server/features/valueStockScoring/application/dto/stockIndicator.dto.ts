import { z } from "zod";
import { valueScoreSchema } from "../../domain/services/calculateValueScore.service";

/**
 * 銘柄指標DTOのスキーマ
 */
export const stockIndicatorDtoSchema = z.object({
  stockId: z.string(),
  tickerCode: z.string(),
  tickerSymbol: z.string(),
  name: z.string(),
  sectorCode: z.string().nullable(),
  sectorName: z.string().nullable(),
  collectedAt: z.string(),
  periodType: z.enum(["weekly", "monthly"]),

  // 財務指標
  currentPrice: z.number().nullable(),
  per: z.number().nullable(),
  pbr: z.number().nullable(),

  // テクニカル指標
  rsi: z.number().nullable(),

  // 価格レンジ指標
  week52High: z.number().nullable(),
  week52Low: z.number().nullable(),

  // 業種平均
  sectorAvgPer: z.number().nullable(),
  sectorAvgPbr: z.number().nullable(),

  // 財務健全性指標（罠銘柄除外用）
  equityRatio: z.number().nullable(),
  operatingIncomeDeclineYears: z.number().nullable(),
  operatingCashFlowNegativeYears: z.number().nullable(),
});

/**
 * 銘柄指標DTO型
 */
export type StockIndicatorDto = z.infer<typeof stockIndicatorDtoSchema>;

/**
 * スコア付き銘柄指標DTOスキーマ
 * クエリサービスから取得したDTOにスコアを付加したもの
 */
export const valueStockDtoSchema = stockIndicatorDtoSchema.extend({
  valueScore: valueScoreSchema,
});

/**
 * スコア付き銘柄指標DTO型
 */
export type ValueStockDto = z.infer<typeof valueStockDtoSchema>;
