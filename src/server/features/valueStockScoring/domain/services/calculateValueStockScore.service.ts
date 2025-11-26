import { getMarketType } from "@/constants/marketTypes";
import { type ValueStockScore, valueStockScoreSchema } from "../entities/valueStockScore";
import type { ScoringConfig } from "../values/scoringConfig";
import { totalScoreSchema } from "../values/totalScore";
import { calculatePBRScore } from "./calculatePBRScore.service";
import { calculatePERScore } from "./calculatePERScore.service";
import { calculatePriceRangeScore } from "./calculatePriceRangeScore.service";
import { calculateRSIScore } from "./calculateRSIScore.service";
import { calculateSectorScore } from "./calculateSectorScore.service";

/**
 * スコア計算に必要な指標データの型
 * DTOやエンティティから必要なプロパティのみを抽出
 * ドメインサービスがアプリケーション層に依存しないようにする
 */
export type ScoringIndicator = Readonly<{
  currentPrice: number | null;
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  priceHigh: number | null;
  priceLow: number | null;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
  market: string | null;
}>;

/**
 * 割安株スコア計算関数の型定義
 */
export type CalculateValueStockScore = (
  indicator: ScoringIndicator,
  config: ScoringConfig,
) => ValueStockScore;

/**
 * 割安株スコアを計算
 * 設定された重み付けに基づいて各指標のスコアを算出し、集約エンティティとして返却
 *
 * TODO: ドメインサービスでエンティティを返却するのは不自然。
 * 各スコア計算結果を返し、エンティティの生成はユースケース層で行うべき。
 */
export const calculateValueStockScore: CalculateValueStockScore = (indicator, config) => {
  const marketType = getMarketType(indicator.market);
  const marketAdjustments = config.marketAdjustments[marketType];

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

  const sectorScore = calculateSectorScore(perScore, pbrScore);

  // 設定された重み付けでトータルスコア算出（重み合計は100%）
  const totalScoreValue =
    (perScore * (config.perWeight / 100) +
      pbrScore * (config.pbrWeight / 100) +
      rsiScore * (config.rsiWeight / 100) +
      priceRangeScore * (config.priceRangeWeight / 100)) /
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
