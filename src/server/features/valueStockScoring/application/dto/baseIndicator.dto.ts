import { z } from "zod";

/**
 * 共通の指標DTOベーススキーマ
 */
export const baseIndicatorDtoSchema = z.object({
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

export type BaseIndicatorDto = z.infer<typeof baseIndicatorDtoSchema>;
