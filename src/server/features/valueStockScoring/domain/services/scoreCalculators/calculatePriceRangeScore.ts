import { calculatePricePosition } from "../../../infrastructure/externalServices/yahooFinance/calculatePricePosition";
import type { ScoringConfig } from "../../values/scoringConfig";

/**
 * 価格レンジスコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - 安値から30%以内: 100点
 * - 安値から30-40%: 75点
 * - 安値から40-50%: 50点
 * - 安値から50-60%: 25点
 * - それ以上: 0点
 */
export const calculatePriceRangeScore = (
  currentPrice: number,
  fiftyTwoWeekHigh: number,
  fiftyTwoWeekLow: number,
  config: ScoringConfig,
): number => {
  const position = calculatePricePosition(currentPrice, fiftyTwoWeekHigh, fiftyTwoWeekLow);

  if (position <= config.priceRangeThresholds.veryLow) {
    return 100;
  }
  if (position <= config.priceRangeThresholds.low) {
    return 75;
  }
  if (position <= 0.5) {
    return 50;
  }
  if (position <= 0.6) {
    return 25;
  }
  return 0;
};
