import YahooFinance from "yahoo-finance2";
import {
  type HistoricalDataPointDto,
  historicalDataPointDtoSchema,
} from "../../../application/dto/yahooFinance.dto";

const yahooFinance = new YahooFinance();

/**
 * 月足データを取得
 */
export const getMonthlyData = async (
  tickerSymbol: string,
  months = 12,
): Promise<HistoricalDataPointDto[]> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const result = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate,
      interval: "1mo",
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
    console.error(`Error fetching monthly data for ${tickerSymbol}:`, error);
    return [];
  }
};
