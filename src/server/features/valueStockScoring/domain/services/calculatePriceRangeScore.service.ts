import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";
import type { MarketAdjustments, ScoringConfig } from "../values/scoringConfig";

/**
 * 価格レンジスコア計算関数の型定義
 */
export type CalculatePriceRangeScore = (
  currentPrice: number | null,
  priceHigh: number | null,
  priceLow: number | null,
  config: ScoringConfig,
  marketAdjustments: MarketAdjustments,
) => IndicatorScore;

/**
 * 価格レンジスコアを計算（線形スケール 0-100）
 * 安値からの位置で評価し、市場別補正を適用
 */
export const calculatePriceRangeScore: CalculatePriceRangeScore = (
  currentPrice,
  priceHigh,
  priceLow,
  config,
  marketAdjustments,
) => {
  if (currentPrice === null || priceHigh === null || priceLow === null) {
    return 0;
  }

  if (priceHigh === priceLow) return 0;

  // 異常値チェック: 現在価格が期間レンジ外の場合
  if (currentPrice < priceLow || currentPrice > priceHigh) {
    // console.warn(
    //   `[calculatePriceRangeScore] Price out of range: current=${currentPrice}, range=[${priceLow}, ${priceHigh}]`,
    // );
    return 0;
  }

  const rangePosition = ((currentPrice - priceLow) / (priceHigh - priceLow)) * 100;
  const { bottom, low } = config.priceRangeThresholds;

  let baseScore: number;

  if (rangePosition <= bottom) {
    // 底値圏: 100点
    baseScore = 100;
  } else if (rangePosition <= low) {
    // 底値圏〜安値圏の間: 線形補間
    baseScore = 100 - ((rangePosition - bottom) / (low - bottom)) * 50;
  } else if (rangePosition <= 100) {
    // 安値圏〜高値圏の間: 線形補間
    baseScore = 50 - ((rangePosition - low) / (100 - low)) * 50;
  } else {
    baseScore = 0;
  }

  // 市場別補正を適用してクリップ
  const adjusted = clamp(baseScore * marketAdjustments.priceRange, 0, 100);
  return indicatorScoreSchema.parse(Math.round(adjusted));
};
