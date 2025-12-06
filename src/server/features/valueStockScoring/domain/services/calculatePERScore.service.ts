import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";
import type { RatioThresholds } from "../values/scoringConfig";

/**
 * PERスコア計算関数の型定義
 */
export type CalculatePERScore = (
  per: number | null,
  sectorAvgPer: number | null,
  thresholds: RatioThresholds,
) => IndicatorScore;

/**
 * PERスコアを計算（線形スケール 0-100）
 *
 * 業種平均との比率で評価:
 * - ratio ≤ 70%:  100点（割安）
 * - ratio ≤ 100%: 100→50点（線形補間）
 * - ratio ≤ 150%: 50→0点（線形補間）
 * - ratio > 150%: 0点（割高）
 *
 * 除外条件: PER ≤ 0、業種平均PER ≤ 0 の場合は0点
 */
export const calculatePERScore: CalculatePERScore = (per, sectorAvgPer, thresholds) => {
  if (per === null || per <= 0 || sectorAvgPer === null || sectorAvgPer <= 0) {
    return 0;
  }

  const ratio = (per / sectorAvgPer) * 100; // パーセント表示
  const { excellent, good } = thresholds;

  let score: number;

  if (ratio <= excellent) {
    // 優良ゾーン: 100点
    score = 100;
  } else if (ratio <= good) {
    // 優良〜良好の間: 線形補間（100→50点）
    score = 100 - ((ratio - excellent) / (good - excellent)) * 50;
  } else if (ratio <= 150) {
    // 良好〜標準の間: 線形補間（50→0点）
    score = 50 - ((ratio - good) / (150 - good)) * 50;
  } else {
    // 割高: 0点
    score = 0;
  }

  return indicatorScoreSchema.parse(Math.round(clamp(score, 0, 100)));
};
