import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

/**
 * ヒストリカルデータの型定義
 */
export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 週足データを取得
 *
 * @param tickerSymbol - 銘柄シンボル（例: "7203.T"）
 * @param weeks - 取得する週数（デフォルト: 26週 = 約6ヶ月）
 * @returns 週足データの配列
 */
export async function getWeeklyData(
  tickerSymbol: string,
  weeks = 26,
): Promise<HistoricalDataPoint[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const result = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate,
      interval: "1wk",
    });

    return result.map((item) => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
  } catch (error) {
    console.error(`Error fetching weekly data for ${tickerSymbol}:`, error);
    return [];
  }
}

/**
 * 月足データを取得
 *
 * @param tickerSymbol - 銘柄シンボル（例: "7203.T"）
 * @param months - 取得する月数（デフォルト: 12ヶ月）
 * @returns 月足データの配列
 */
export async function getMonthlyData(
  tickerSymbol: string,
  months = 12,
): Promise<HistoricalDataPoint[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const result = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate,
      interval: "1mo",
    });

    return result.map((item) => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
  } catch (error) {
    console.error(`Error fetching monthly data for ${tickerSymbol}:`, error);
    return [];
  }
}

/**
 * 日足データを取得（RSI計算用）
 *
 * @param tickerSymbol - 銘柄シンボル（例: "7203.T"）
 * @param days - 取得する日数（デフォルト: 30日）
 * @returns 日足データの配列
 */
export async function getDailyData(
  tickerSymbol: string,
  days = 30,
): Promise<HistoricalDataPoint[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    });

    return result.map((item) => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
  } catch (error) {
    console.error(`Error fetching daily data for ${tickerSymbol}:`, error);
    return [];
  }
}

/**
 * 52週高値・安値からの現在価格の位置を計算
 *
 * @param currentPrice - 現在価格
 * @param fiftyTwoWeekHigh - 52週高値
 * @param fiftyTwoWeekLow - 52週安値
 * @returns 0-1の範囲での位置（0=安値, 1=高値）
 */
export function calculatePricePosition(
  currentPrice: number,
  fiftyTwoWeekHigh: number,
  fiftyTwoWeekLow: number,
): number {
  if (fiftyTwoWeekHigh === fiftyTwoWeekLow) {
    return 0.5; // 高値と安値が同じ場合は中間とする
  }

  const position = (currentPrice - fiftyTwoWeekLow) / (fiftyTwoWeekHigh - fiftyTwoWeekLow);

  // 0-1の範囲にクランプ
  return Math.max(0, Math.min(1, position));
}
