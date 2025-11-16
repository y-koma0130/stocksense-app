import { SMA } from "technicalindicators";
import type { HistoricalDataPoint } from "../yahoo-finance/historical";

/**
 * 単純移動平均 (Simple Moving Average) を計算
 *
 * @param historicalData - ヒストリカルデータの配列
 * @param period - 移動平均期間
 * @returns 移動平均値、データ不足の場合はnull
 */
export function calculateSMA(historicalData: HistoricalDataPoint[], period: number): number | null {
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
}

/**
 * 複数期間の移動平均を一括計算
 *
 * @param historicalData - ヒストリカルデータの配列
 * @param periods - 期間の配列（例: [5, 25, 75]）
 * @returns 期間ごとの移動平均値のMap
 */
export function calculateMultipleSMA(
  historicalData: HistoricalDataPoint[],
  periods: number[],
): Map<number, number | null> {
  const results = new Map<number, number | null>();

  for (const period of periods) {
    const sma = calculateSMA(historicalData, period);
    results.set(period, sma);
  }

  return results;
}

/**
 * ゴールデンクロス判定（短期MAが長期MAを上抜け）
 *
 * @param shortTermMA - 短期移動平均
 * @param longTermMA - 長期移動平均
 * @param prevShortTermMA - 前回の短期移動平均
 * @param prevLongTermMA - 前回の長期移動平均
 * @returns ゴールデンクロスの場合true
 */
export function isGoldenCross(
  shortTermMA: number,
  longTermMA: number,
  prevShortTermMA: number,
  prevLongTermMA: number,
): boolean {
  return prevShortTermMA <= prevLongTermMA && shortTermMA > longTermMA;
}

/**
 * デッドクロス判定（短期MAが長期MAを下抜け）
 *
 * @param shortTermMA - 短期移動平均
 * @param longTermMA - 長期移動平均
 * @param prevShortTermMA - 前回の短期移動平均
 * @param prevLongTermMA - 前回の長期移動平均
 * @returns デッドクロスの場合true
 */
export function isDeadCross(
  shortTermMA: number,
  longTermMA: number,
  prevShortTermMA: number,
  prevLongTermMA: number,
): boolean {
  return prevShortTermMA >= prevLongTermMA && shortTermMA < longTermMA;
}
