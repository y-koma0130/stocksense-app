import type { PbrPenaltyThresholds, RatioThresholds } from "../config/thresholdTypes";
import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";

/**
 * PBRスコア計算関数の型定義
 */
export type CalculatePBRScore = (
  pbr: number | null,
  sectorAvgPbr: number | null,
  roe: number | null,
  thresholds: RatioThresholds,
  penaltyThresholds: PbrPenaltyThresholds,
) => IndicatorScore;

/**
 * PBRスコアを計算（線形スケール 0-100）
 *
 * 基本スコア（業種平均比）:
 * - ratio < 40%:  60点（低すぎ警告）
 * - ratio ≤ 70%:  100点
 * - ratio ≤ 100%: 100→50点（線形補間）
 * - ratio ≤ 150%: 50→0点（線形補間）
 * - ratio > 150%: 0点
 *
 * 絶対値ペナルティ:
 * - PBR < 0.3倍: スコア × 0.7（30%減点）
 * - PBR < 0.5倍 かつ ROE < 5%: スコア × 0.8（20%減点）
 *
 * 設計意図:
 * - PBR 0.3倍未満は市場が「将来性なし」と評価している可能性
 * - PBR 0.5倍未満 かつ 低ROEは典型的なバリュートラップ
 */
export const calculatePBRScore: CalculatePBRScore = (
  pbr,
  sectorAvgPbr,
  roe,
  thresholds,
  penaltyThresholds,
) => {
  if (pbr === null || pbr <= 0 || sectorAvgPbr === null || sectorAvgPbr <= 0) {
    return 0;
  }

  const ratio = (pbr / sectorAvgPbr) * 100;
  const { excellent, good } = thresholds;

  let baseScore: number;

  // 40%未満は「低すぎ警告」で60点に制限
  if (ratio < 40) {
    baseScore = 60;
  } else if (ratio <= excellent) {
    // 優良ゾーン: 100点
    baseScore = 100;
  } else if (ratio <= good) {
    // 優良〜良好の間: 線形補間（100→50点）
    baseScore = 100 - ((ratio - excellent) / (good - excellent)) * 50;
  } else if (ratio <= 150) {
    // 良好〜標準の間: 線形補間（50→0点）
    baseScore = 50 - ((ratio - good) / (150 - good)) * 50;
  } else {
    // 割高: 0点
    baseScore = 0;
  }

  // 絶対値ペナルティの適用
  let penaltyMultiplier = 1.0;

  if (pbr < penaltyThresholds.severelyLow) {
    // PBR 0.3倍未満: 30%減点
    penaltyMultiplier = penaltyThresholds.severePenalty;
  } else if (
    pbr < penaltyThresholds.low &&
    (roe === null || roe < penaltyThresholds.lowRoeThreshold)
  ) {
    // PBR 0.5倍未満 かつ ROE 5%未満: 20%減点
    penaltyMultiplier = penaltyThresholds.lowPenalty;
  }

  const finalScore = clamp(baseScore * penaltyMultiplier, 0, 100);
  return indicatorScoreSchema.parse(Math.round(finalScore));
};
