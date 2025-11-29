import { clamp } from "../utils/clamp";

/**
 * EPS成長率（CAGR）計算関数の型定義
 * @param epsLatest - 最新年度のEPS
 * @param eps3yAgo - 3年前のEPS
 * @returns 年率成長率(%)、計算不可の場合はnull
 */
export type CalculateEpsGrowthRate = (
  epsLatest: number | null,
  eps3yAgo: number | null,
) => number | null;

/**
 * EPS成長率スコア計算関数の型定義
 * @param epsLatest - 最新年度のEPS
 * @param eps3yAgo - 3年前のEPS
 * @returns 0-100のスコア（nullの場合は中央値50を返す）
 */
export type CalculateEpsGrowthScore = (epsLatest: number | null, eps3yAgo: number | null) => number;

/**
 * 3年EPS成長率（CAGR）を計算する
 *
 * CAGR = ((最新値 / 3年前の値)^(1/3) - 1) × 100
 *
 * 計算できないケース:
 * - どちらかがnull
 * - 3年前のEPSが0以下（負のEPSからの成長率は意味をなさない）
 * - 最新のEPSが負（赤字転落は別の評価が必要）
 */
export const calculateEpsGrowthRate: CalculateEpsGrowthRate = (epsLatest, eps3yAgo) => {
  // どちらかがnullの場合は計算不可
  if (epsLatest === null || eps3yAgo === null) {
    return null;
  }

  // 3年前のEPSが0以下の場合は計算不可
  // 負のEPSからの成長率は数学的に意味をなさない
  if (eps3yAgo <= 0) {
    return null;
  }

  // 最新のEPSが負の場合は計算不可
  // 赤字転落は別途評価が必要
  if (epsLatest < 0) {
    return null;
  }

  // CAGR計算: ((最新 / 3年前)^(1/3) - 1) × 100
  const ratio = epsLatest / eps3yAgo;
  const cagr = (ratio ** (1 / 3) - 1) * 100;

  return cagr;
};

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
