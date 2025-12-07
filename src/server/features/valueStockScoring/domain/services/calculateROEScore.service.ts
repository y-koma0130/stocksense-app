import type { RoeThresholds } from "../config/thresholdTypes";
import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";

/**
 * ROEスコア計算関数の型定義
 */
export type CalculateROEScore = (roe: number | null, thresholds: RoeThresholds) => IndicatorScore;

/**
 * ROEスコアを計算（線形スケール 0-100）
 *
 * 閾値:
 * - ROE < 5%:  0点
 * - ROE 5-8%:  0→50点（線形補間）
 * - ROE 8-15%: 50→100点（線形補間）
 * - ROE ≥ 15%: 100点
 *
 * 設計意図: 長期保有では収益性の持続が重要
 */
export const calculateROEScore: CalculateROEScore = (roe, thresholds) => {
  // ROE取得不可の場合は50点（中央値）
  if (roe === null) {
    return indicatorScoreSchema.parse(50);
  }

  const { low, medium, high } = thresholds;
  let score: number;

  if (roe < low) {
    // 低ROE: 0点
    score = 0;
  } else if (roe < medium) {
    // 低〜中程度: 線形補間（0→50点）
    score = ((roe - low) / (medium - low)) * 50;
  } else if (roe < high) {
    // 中程度〜高: 線形補間（50→100点）
    score = 50 + ((roe - medium) / (high - medium)) * 50;
  } else {
    // 高ROE: 100点
    score = 100;
  }

  return indicatorScoreSchema.parse(Math.round(clamp(score, 0, 100)));
};
