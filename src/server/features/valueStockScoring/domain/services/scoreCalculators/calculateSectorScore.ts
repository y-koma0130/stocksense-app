import type { ScoringConfig } from "../../values/scoringConfig";

/**
 * 業種比較スコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - PER/PBRが業種平均の70%以下: 100点
 * - 70-85%: 75点
 * - 85-100%: 50点
 * - 100-115%: 25点
 * - 115%超: 0点
 */
export const calculateSectorScore = (
  per: number | null,
  pbr: number | null,
  sectorAvgPer: number | null,
  sectorAvgPbr: number | null,
  config: ScoringConfig,
): number => {
  let perSectorScore = 0;
  let pbrSectorScore = 0;
  let validScores = 0;

  // PER業種比較
  if (per !== null && sectorAvgPer !== null && sectorAvgPer > 0) {
    const perRatio = per / sectorAvgPer;
    if (perRatio <= config.sectorThresholds.muchLower) {
      perSectorScore = 100;
    } else if (perRatio <= config.sectorThresholds.lower) {
      perSectorScore = 75;
    } else if (perRatio <= 1.0) {
      perSectorScore = 50;
    } else if (perRatio <= 1.15) {
      perSectorScore = 25;
    }
    validScores++;
  }

  // PBR業種比較
  if (pbr !== null && sectorAvgPbr !== null && sectorAvgPbr > 0) {
    const pbrRatio = pbr / sectorAvgPbr;
    if (pbrRatio <= config.sectorThresholds.muchLower) {
      pbrSectorScore = 100;
    } else if (pbrRatio <= config.sectorThresholds.lower) {
      pbrSectorScore = 75;
    } else if (pbrRatio <= 1.0) {
      pbrSectorScore = 50;
    } else if (pbrRatio <= 1.15) {
      pbrSectorScore = 25;
    }
    validScores++;
  }

  if (validScores === 0) {
    return 0;
  }
  return (perSectorScore + pbrSectorScore) / validScores;
};
