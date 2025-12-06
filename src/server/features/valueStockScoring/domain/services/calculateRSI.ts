import { RSI } from "technicalindicators";
import type { HistoricalDataPointDto } from "../../application/dto/yahooFinance.dto";

/**
 * RSI (Relative Strength Index) を計算
 * TODO: 型関数化
 */
export const calculateRSI = (
  historicalData: HistoricalDataPointDto[],
  period = 14,
): number | null => {
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
};

/**
 * RSI値から売られすぎ判定を行う
 */
export const isOversold = (rsi: number, threshold = 30): boolean => {
  return rsi < threshold;
};

/**
 * RSI値から買われすぎ判定を行う
 */
export const isOverbought = (rsi: number, threshold = 70): boolean => {
  return rsi > threshold;
};
