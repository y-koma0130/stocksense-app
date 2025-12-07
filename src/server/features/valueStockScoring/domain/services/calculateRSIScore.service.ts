import type { RsiThresholds } from "../config/thresholdTypes";
import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";

/**
 * RSIスコア計算関数の型定義
 */
export type CalculateRSIScore = (rsi: number | null, thresholds: RsiThresholds) => IndicatorScore;

/**
 * RSIスコアを計算（線形スケール 0-100）
 *
 * 閾値:
 * - RSI ≤ 30: 100点（売られすぎ）
 * - RSI ≤ 50: 100→50点（線形補間）
 * - RSI ≤ 70: 50→0点（線形補間）
 * - RSI > 70: 0点（買われすぎ）
 */
export const calculateRSIScore: CalculateRSIScore = (rsi, thresholds) => {
  if (rsi === null) return indicatorScoreSchema.parse(0);

  const { oversold, neutral } = thresholds;

  let score: number;

  if (rsi <= oversold) {
    // 売られすぎ: 100点
    score = 100;
  } else if (rsi <= neutral) {
    // 売られすぎ〜中立の間: 線形補間
    score = 100 - ((rsi - oversold) / (neutral - oversold)) * 50;
  } else if (rsi <= 70) {
    // 中立〜買われすぎの間: 線形補間
    score = 50 - ((rsi - neutral) / (70 - neutral)) * 50;
  } else {
    // 買われすぎ: 0点
    score = 0;
  }

  return indicatorScoreSchema.parse(Math.round(clamp(score, 0, 100)));
};
