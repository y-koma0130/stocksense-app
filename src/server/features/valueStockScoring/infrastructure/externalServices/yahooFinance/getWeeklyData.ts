import YahooFinance from "yahoo-finance2";
import {
  type HistoricalDataPointDto,
  historicalDataPointDtoSchema,
} from "../../../application/dto/yahooFinance.dto";

const yahooFinance = new YahooFinance();

/**
 * 週足データを取得
 */
export const getWeeklyData = async (
  tickerSymbol: string,
  weeks = 26,
): Promise<HistoricalDataPointDto[]> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const result = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate,
      interval: "1wk",
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
    console.error(`Error fetching weekly data for ${tickerSymbol}:`, error);
    return [];
  }
};
