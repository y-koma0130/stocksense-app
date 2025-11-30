/**
 * LINE銘柄分析用の中期銘柄指標DTO
 */

import { z } from "zod";

/**
 * 中期銘柄指標DTOスキーマ（1-6ヶ月向け）
 */
export const midTermStockIndicatorDtoSchema = z.object({
  stockId: z.string(),
  tickerCode: z.string(),
  name: z.string(),
  sectorCode: z.string().nullable(),
  sectorName: z.string().nullable(),
  market: z.string().nullable(),
  currentPrice: z.number().nullable(),
  per: z.number().nullable(),
  pbr: z.number().nullable(),
  rsi: z.number().nullable(),
  rsiShort: z.number().nullable(), // 短期RSI（2週）- モメンタム計算用
  priceHigh: z.number().nullable(),
  priceLow: z.number().nullable(),
  sectorAvgPer: z.number().nullable(),
  sectorAvgPbr: z.number().nullable(),
  epsLatest: z.number().nullable(),
  eps3yAgo: z.number().nullable(),
});

/**
 * 中期銘柄指標DTO型
 */
export type MidTermStockIndicatorDto = z.infer<typeof midTermStockIndicatorDtoSchema>;
