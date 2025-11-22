import YahooFinance from "yahoo-finance2";
import {
  type HistoricalDataPointDto,
  historicalDataPointDtoSchema,
} from "../../../application/dto/yahooFinance.dto";

const yahooFinance = new YahooFinance();

/**
 * 日足データを取得する関数の型定義
 */
export type GetDailyData = (
  tickerSymbol: string,
  days?: number,
) => Promise<HistoricalDataPointDto[]>;

/**
 * 日足データを取得（RSI計算用）
 */
export const getDailyData: GetDailyData = async (tickerSymbol, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    });

    return result.map((item) =>
      historicalDataPointDtoSchema.parse({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }),
    );
  } catch (error) {
    console.error(`Error fetching daily data for ${tickerSymbol}:`, error);
    return [];
  }
};
