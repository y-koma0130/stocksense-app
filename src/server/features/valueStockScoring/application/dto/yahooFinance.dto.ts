import { z } from "zod";

/**
 * ヒストリカルデータポイントのDTO
 */
export const historicalDataPointDtoSchema = z.object({
  date: z.date(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type HistoricalDataPointDto = z.infer<typeof historicalDataPointDtoSchema>;

/**
 * 財務指標データのDTO
 */
export const fundamentalsDataDtoSchema = z.object({
  tickerSymbol: z.string(),
  currentPrice: z.number().nullable(),
  per: z.number().nullable(),
  pbr: z.number().nullable(),
  marketCap: z.number().nullable(),
  fiftyTwoWeekHigh: z.number().nullable(),
  fiftyTwoWeekLow: z.number().nullable(),
});

export type FundamentalsDataDto = z.infer<typeof fundamentalsDataDtoSchema>;
