import type { ScoringConfig } from "../../values/scoringConfig";

/**
 * PBRスコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - PBR 0.8以下: 100点
 * - PBR 0.8-1.0: 75点
 * - PBR 1.0-1.5: 50点
 * - PBR 1.5-2.0: 25点
 * - PBR 2.0超: 0点
 * - PBRがnullの場合: 0点
 */
export const calculatePBRScore = (pbr: number | null, config: ScoringConfig): number => {
  if (pbr === null || pbr <= 0) {
    return 0;
  }

  if (pbr <= config.pbrThresholds.veryLow) {
    return 100;
  }
  if (pbr <= config.pbrThresholds.low) {
    return 75;
  }
  if (pbr <= 1.5) {
    return 50;
  }
  if (pbr <= 2.0) {
    return 25;
  }
  return 0;
};
