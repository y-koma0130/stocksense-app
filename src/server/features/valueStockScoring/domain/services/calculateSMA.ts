import { SMA } from "technicalindicators";
import type { HistoricalDataPointDto } from "../../application/dto/yahooFinance.dto";

/**
 * 単純移動平均 (Simple Moving Average) を計算
 */
export const calculateSMA = (
  historicalData: HistoricalDataPointDto[],
  period: number,
): number | null => {
  if (historicalData.length < period) {
    console.warn(`SMA${period}計算に必要なデータが不足しています`);
    return null;
  }

  // 日付順にソート（古い順）
  const sortedData = [...historicalData].sort((a, b) => a.date.getTime() - b.date.getTime());

  // 終値の配列を抽出
  const closePrices = sortedData.map((d) => d.close);

  // SMAを計算
  const smaValues = SMA.calculate({
    values: closePrices,
    period,
  });

  // 最新のSMA値を返す
  if (smaValues.length === 0) {
    return null;
  }

  return smaValues[smaValues.length - 1];
};

/**
 * 複数期間の移動平均を一括計算
 */
export const calculateMultipleSMA = (
  historicalData: HistoricalDataPointDto[],
  periods: number[],
): Map<number, number | null> => {
  const results = new Map<number, number | null>();

  for (const period of periods) {
    const sma = calculateSMA(historicalData, period);
    results.set(period, sma);
  }

  return results;
};

/**
 * ゴールデンクロス判定（短期MAが長期MAを上抜け）
 */
export const isGoldenCross = (
  shortTermMA: number,
  longTermMA: number,
  prevShortTermMA: number,
  prevLongTermMA: number,
): boolean => {
  return prevShortTermMA <= prevLongTermMA && shortTermMA > longTermMA;
};

/**
 * デッドクロス判定（短期MAが長期MAを下抜け）
 */
export const isDeadCross = (
  shortTermMA: number,
  longTermMA: number,
  prevShortTermMA: number,
  prevLongTermMA: number,
): boolean => {
  return prevShortTermMA >= prevLongTermMA && shortTermMA < longTermMA;
};
