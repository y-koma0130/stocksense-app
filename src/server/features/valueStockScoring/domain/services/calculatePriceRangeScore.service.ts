import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";
import type { PriceRangeThresholds } from "../values/scoringConfig";

/**
 * 価格レンジスコア計算関数の型定義
 */
export type CalculatePriceRangeScore = (
  currentPrice: number | null,
  priceHigh: number | null,
  priceLow: number | null,
  thresholds: PriceRangeThresholds,
) => IndicatorScore;

/**
 * 価格レンジスコアを計算（線形スケール 0-100）
 *
 * 安値からの位置で評価:
 * - position ≤ 20%:  100点（底値圏）
 * - position ≤ 40%:  100→50点（線形補間）
 * - position ≤ 100%: 50→0点（線形補間）
 *
 * 除外条件: 現在価格・高値・安値がnull、高値=安値、価格がレンジ外の場合は0点
 */
export const calculatePriceRangeScore: CalculatePriceRangeScore = (
  currentPrice,
  priceHigh,
  priceLow,
  thresholds,
) => {
  if (currentPrice === null || priceHigh === null || priceLow === null) {
    return 0;
  }

  if (priceHigh === priceLow) return 0;

  // 異常値チェック: 現在価格が期間レンジ外の場合
  if (currentPrice < priceLow || currentPrice > priceHigh) {
    return 0;
  }

  const rangePosition = ((currentPrice - priceLow) / (priceHigh - priceLow)) * 100;
  const { bottom, low } = thresholds;

  let score: number;

  if (rangePosition <= bottom) {
    // 底値圏: 100点
    score = 100;
  } else if (rangePosition <= low) {
    // 底値圏〜安値圏の間: 線形補間（100→50点）
    score = 100 - ((rangePosition - bottom) / (low - bottom)) * 50;
  } else if (rangePosition <= 100) {
    // 安値圏〜高値圏の間: 線形補間（50→0点）
    score = 50 - ((rangePosition - low) / (100 - low)) * 50;
  } else {
    score = 0;
  }

  return indicatorScoreSchema.parse(Math.round(clamp(score, 0, 100)));
};
