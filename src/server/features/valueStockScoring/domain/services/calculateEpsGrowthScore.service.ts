import { calculateEpsGrowthRate } from "./calculateEpsGrowthRate.service";

/**
 * EPS成長率スコア計算関数の型定義
 * @param epsLatest - 最新年度のEPS
 * @param eps3yAgo - 3年前のEPS
 * @returns 0-100のスコア（nullの場合は中央値50を返す）
 */
export type CalculateEpsGrowthScore = (epsLatest: number | null, eps3yAgo: number | null) => number;

/**
 * EPS成長率をスコアに変換する
 *
 * スコアリング:
 * - 20%以上: 100点（高成長）
 * - 10-20%: 50-100点（良好な成長）
 * - 0-10%: 0-50点（低成長）
 * - 0%未満: 0点（マイナス成長）
 *
 * 長期バリュー投資では安定した利益成長が重要なため、
 * 年率10%以上の成長に高いスコアを与える
 */
export const calculateEpsGrowthScore: CalculateEpsGrowthScore = (epsLatest, eps3yAgo) => {
  const growthRate = calculateEpsGrowthRate(epsLatest, eps3yAgo);

  // 成長率が計算できない場合は中央値を返す
  if (growthRate === null) {
    return 50;
  }

  // マイナス成長は0点
  if (growthRate < 0) {
    return 0;
  }

  // 0-10%: 0-50点に線形マッピング
  if (growthRate <= 10) {
    return (growthRate / 10) * 50;
  }

  // 10-20%: 50-100点に線形マッピング
  if (growthRate <= 20) {
    return 50 + ((growthRate - 10) / 10) * 50;
  }

  // 20%以上: 100点
  return 100;
};
