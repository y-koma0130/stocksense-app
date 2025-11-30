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
  if (epsLatest === null || eps3yAgo === null) {
    return null;
  }

  if (eps3yAgo <= 0) {
    return null;
  }

  if (epsLatest < 0) {
    return null;
  }

  const ratio = epsLatest / eps3yAgo;
  const cagr = (ratio ** (1 / 3) - 1) * 100;

  return cagr;
};
