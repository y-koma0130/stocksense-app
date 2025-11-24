import type { ScoringConfig } from "../../values/scoringConfig";

/**
 * RSIスコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - RSI 30以下（売られすぎ）: 100点
 * - RSI 30-40: 75点
 * - RSI 40-50: 50点
 * - RSI 50-60: 25点
 * - RSI 60超: 0点
 * - RSIがnullの場合: 0点
 */
export const calculateRSIScore = (rsi: number | null, config: ScoringConfig): number => {
  if (rsi === null) {
    return 0;
  }

  if (rsi <= config.rsiThresholds.oversold) {
    return 100;
  }
  if (rsi <= config.rsiThresholds.moderate) {
    return 75;
  }
  if (rsi <= 50) {
    return 50;
  }
  if (rsi <= 60) {
    return 25;
  }
  return 0;
};
