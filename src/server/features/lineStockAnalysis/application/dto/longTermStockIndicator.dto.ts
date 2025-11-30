/**
 * LINE銘柄分析用の長期銘柄指標DTO
 */

import { z } from "zod";

/**
 * 長期銘柄指標DTOスキーマ（6ヶ月-3年向け）
 */
export const longTermStockIndicatorDtoSchema = z.object({
  stockId: z.string(),
  tickerCode: z.string(),
  name: z.string(),
  sectorCode: z.string().nullable(),
  sectorName: z.string().nullable(),
  market: z.string().nullable(),
  currentPrice: z.number().nullable(),
  per: z.number().nullable(),
  pbr: z.number().nullable(),
  rsi: z.number().nullable(), // 52週RSI
  priceHigh: z.number().nullable(),
  priceLow: z.number().nullable(),
  sectorAvgPer: z.number().nullable(),
  sectorAvgPbr: z.number().nullable(),
  epsLatest: z.number().nullable(),
  eps3yAgo: z.number().nullable(),
});

/**
 * 長期銘柄指標DTO型
 */
export type LongTermStockIndicatorDto = z.infer<typeof longTermStockIndicatorDtoSchema>;
