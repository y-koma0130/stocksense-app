import { getMarketType } from "@/constants/marketTypes";
import type { MidTermIndicatorDto } from "../../application/dto/indicator.dto";
import { type ValueStockScore, valueStockScoreSchema } from "../entities/valueStockScore";
import { MID_TERM_CONFIG } from "../values/scoringConfig";
import { totalScoreSchema } from "../values/totalScore";
import { calculatePBRScore } from "./calculatePBRScore.service";
import { calculatePERScore } from "./calculatePERScore.service";
import { calculatePriceRangeScore } from "./calculatePriceRangeScore.service";
import { calculateRSIMomentumScore } from "./calculateRSIMomentumScore.service";
import { calculateRSIScore } from "./calculateRSIScore.service";
import { calculateSectorScore } from "./calculateSectorScore.service";
import { calculateVolumeSurgeScore } from "./calculateVolumeSurgeScore.service";

/**
 * 中期スコア計算関数の型定義
 */
export type CalculateMidTermValueStockScore = (indicator: MidTermIndicatorDto) => ValueStockScore;

/**
 * 中期割安株スコアを計算
 *
 * 重み配分:
 * - PER: 24%
 * - PBR: 18%
 * - RSI（静的）: 16%
 * - 価格位置: 12%
 * - RSIモメンタム: 18%
 * - 出来高急増: 12%
 */
export const calculateMidTermValueStockScore: CalculateMidTermValueStockScore = (indicator) => {
  const config = MID_TERM_CONFIG;
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

  // 中期専用スコア
  const rsiMomentumScore = calculateRSIMomentumScore(indicator.rsiShort, indicator.rsi);
  const volumeSurgeScore = calculateVolumeSurgeScore(
    indicator.avgVolumeShort,
    indicator.avgVolumeLong,
  );

  const sectorScore = calculateSectorScore(perScore, pbrScore);

  // 重み付けでトータルスコア算出
  const rsiMomentumWeight = config.rsiMomentumWeight ?? 0;
  const volumeSurgeWeight = config.volumeSurgeWeight ?? 0;

  const totalScoreValue =
    (perScore * (config.perWeight / 100) +
      pbrScore * (config.pbrWeight / 100) +
      rsiScore * (config.rsiWeight / 100) +
      priceRangeScore * (config.priceRangeWeight / 100) +
      rsiMomentumScore * (rsiMomentumWeight / 100) +
      volumeSurgeScore * (volumeSurgeWeight / 100)) /
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
