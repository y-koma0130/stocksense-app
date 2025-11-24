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

/**
 * 財務健全性データのDTO（罠銘柄除外用）
 */
export const financialHealthDataDtoSchema = z.object({
  tickerSymbol: z.string(),
  equityRatio: z.number().nullable(), // 自己資本比率(%)
  operatingIncomeDeclineYears: z.number().nullable(), // 営業利益減少連続年数
  operatingCashFlowNegativeYears: z.number().nullable(), // 営業CF負の連続年数
});

export type FinancialHealthDataDto = z.infer<typeof financialHealthDataDtoSchema>;
