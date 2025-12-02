import { getMarketType } from "@/constants/marketTypes";
import type { LongTermIndicatorDto } from "../../application/dto/indicator.dto";
import { type ValueStockScore, valueStockScoreSchema } from "../entities/valueStockScore";
import { LONG_TERM_CONFIG } from "../values/scoringConfig";
import { totalScoreSchema } from "../values/totalScore";
import { calculateEpsGrowthScore } from "./calculateEpsGrowthScore.service";
import { calculatePBRScore } from "./calculatePBRScore.service";
import { calculatePERScore } from "./calculatePERScore.service";
import { calculatePriceRangeScore } from "./calculatePriceRangeScore.service";
import { calculateRSIScore } from "./calculateRSIScore.service";
import { calculateSectorScore } from "./calculateSectorScore.service";

/**
 * 長期スコア計算関数の型定義
 */
export type CalculateLongTermValueStockScore = (indicator: LongTermIndicatorDto) => ValueStockScore;

/**
 * 長期割安株スコアを計算
 *
 * 重み配分:
 * - PER: 28%
 * - PBR: 25%
 * - RSI（静的）: 15%
 * - 価格位置: 12%
 * - EPS成長率: 20%
 */
export const calculateLongTermValueStockScore: CalculateLongTermValueStockScore = (indicator) => {
  const config = LONG_TERM_CONFIG;
  const marketType = getMarketType(indicator.market);
  const marketAdjustments = config.marketAdjustments[marketType];

  // 各スコアを計算
  const perScore = calculatePERScore(
    indicator.per,
    indicator.sectorAvgPer,
    config,
    marketAdjustments,
  );
  const pbrScore = calculatePBRScore(
    indicator.pbr,
    indicator.sectorAvgPbr,
    config,
    marketAdjustments,
  );
  const rsiScore = calculateRSIScore(indicator.rsi, config);
  const priceRangeScore = calculatePriceRangeScore(
    indicator.currentPrice,
    indicator.priceHigh,
    indicator.priceLow,
    config,
    marketAdjustments,
  );

  // 長期専用スコア
  const epsGrowthScore = calculateEpsGrowthScore(indicator.epsLatest, indicator.eps3yAgo);

  const sectorScore = calculateSectorScore(perScore, pbrScore);

  // 重み付けでトータルスコア算出
  const epsGrowthWeight = config.epsGrowthWeight ?? 0;

  const totalScoreValue =
    (perScore * (config.perWeight / 100) +
      pbrScore * (config.pbrWeight / 100) +
      rsiScore * (config.rsiWeight / 100) +
      priceRangeScore * (config.priceRangeWeight / 100) +
      epsGrowthScore * (epsGrowthWeight / 100)) /
    100;

  const totalScore = totalScoreSchema.parse(totalScoreValue);

  return valueStockScoreSchema.parse({
    perScore,
    pbrScore,
    rsiScore,
    priceRangeScore,
    sectorScore,
    totalScore,
  });
};
