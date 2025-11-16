import { RSI } from "technicalindicators";
import type { HistoricalDataPoint } from "../yahoo-finance/historical";

/**
 * RSI (Relative Strength Index) を計算
 *
 * @param historicalData - ヒストリカルデータの配列
 * @param period - RSI期間（デフォルト: 14）
 * @returns RSI値（0-100）、データ不足の場合はnull
 */
export function calculateRSI(historicalData: HistoricalDataPoint[], period = 14): number | null {
  if (historicalData.length < period + 1) {
    console.warn("RSI計算に必要なデータが不足しています");
    return null;
  }

  // 日付順にソート（古い順）
  const sortedData = [...historicalData].sort((a, b) => a.date.getTime() - b.date.getTime());

  // 終値の配列を抽出
  const closePrices = sortedData.map((d) => d.close);

  // RSIを計算
  const rsiValues = RSI.calculate({
    values: closePrices,
    period,
  });

  // 最新のRSI値を返す
  if (rsiValues.length === 0) {
    return null;
  }

  return rsiValues[rsiValues.length - 1];
}

/**
 * RSI値から売られすぎ判定を行う
 *
 * @param rsi - RSI値
 * @param threshold - 売られすぎ判定の閾値（デフォルト: 30）
 * @returns 売られすぎの場合true
 */
export function isOversold(rsi: number, threshold = 30): boolean {
  return rsi < threshold;
}

/**
 * RSI値から買われすぎ判定を行う
 *
 * @param rsi - RSI値
 * @param threshold - 買われすぎ判定の閾値（デフォルト: 70）
 * @returns 買われすぎの場合true
 */
export function isOverbought(rsi: number, threshold = 70): boolean {
  return rsi > threshold;
}
