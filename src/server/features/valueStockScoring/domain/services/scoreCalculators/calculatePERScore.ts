import type { ScoringConfig } from "../../values/scoringConfig";

/**
 * PERスコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - PER 10以下: 100点
 * - PER 10-15: 75点
 * - PER 15-20: 50点
 * - PER 20-25: 25点
 * - PER 25超: 0点
 * - PERがnullの場合: 0点
 */
export const calculatePERScore = (per: number | null, config: ScoringConfig): number => {
  if (per === null || per <= 0) {
    return 0;
  }

  if (per <= config.perThresholds.veryLow) {
    return 100;
  }
  if (per <= config.perThresholds.low) {
    return 75;
  }
  if (per <= 20) {
    return 50;
  }
  if (per <= 25) {
    return 25;
  }
  return 0;
};
