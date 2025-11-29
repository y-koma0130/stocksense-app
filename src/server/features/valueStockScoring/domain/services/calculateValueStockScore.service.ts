import { getMarketType } from "@/constants/marketTypes";
import { type ValueStockScore, valueStockScoreSchema } from "../entities/valueStockScore";
import type { ScoringConfig } from "../values/scoringConfig";
import { totalScoreSchema } from "../values/totalScore";
import { calculateEpsGrowthScore } from "./calculateEpsGrowthScore.service";
import { calculatePBRScore } from "./calculatePBRScore.service";
import { calculatePERScore } from "./calculatePERScore.service";
import { calculatePriceRangeScore } from "./calculatePriceRangeScore.service";
import { calculateRSIMomentumScore } from "./calculateRSIMomentumScore.service";
import { calculateRSIScore } from "./calculateRSIScore.service";
import { calculateSectorScore } from "./calculateSectorScore.service";

/**
 * スコア計算に必要な指標データの型
 * DTOやエンティティから必要なプロパティのみを抽出
 * ドメインサービスがアプリケーション層に依存しないようにする
 *
 * TODO: 中期/長期でスコアリングロジックが異なるため、将来的に以下の分離を検討:
 * - MidTermScoringIndicator: rsiShortを必須フィールドとして持つ
 * - LongTermScoringIndicator: rsiShortを持たない、epsLatest/eps3yAgoを必須で持つ
 * - calculateMidTermScore / calculateLongTermScore に関数を分離
 */
export type ScoringIndicator = Readonly<{
  currentPrice: number | null;
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  rsiShort: number | null; // 短期RSI（2週）- モメンタム計算用（中期のみ、長期はnull）
  priceHigh: number | null;
  priceLow: number | null;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
  market: string | null;
  epsLatest: number | null; // 最新年度のEPS（長期のみ、中期はnull）
  eps3yAgo: number | null; // 3年前のEPS（長期のみ、中期はnull）
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

  // RSIモメンタムスコア（中期のみ、rsiMomentumWeightがある場合のみ計算）
  const rsiMomentumScore =
    config.rsiMomentumWeight !== undefined
      ? calculateRSIMomentumScore(indicator.rsiShort, indicator.rsi)
      : 0;

  // EPS成長率スコア（長期のみ、epsGrowthWeightがある場合のみ計算）
  const epsGrowthScore =
    config.epsGrowthWeight !== undefined
      ? calculateEpsGrowthScore(indicator.epsLatest, indicator.eps3yAgo)
      : 0;

  const sectorScore = calculateSectorScore(perScore, pbrScore);

  // 設定された重み付けでトータルスコア算出（重み合計は100%）
  const rsiMomentumWeight = config.rsiMomentumWeight ?? 0;
  const epsGrowthWeight = config.epsGrowthWeight ?? 0;
  const totalScoreValue =
    (perScore * (config.perWeight / 100) +
      pbrScore * (config.pbrWeight / 100) +
      rsiScore * (config.rsiWeight / 100) +
      priceRangeScore * (config.priceRangeWeight / 100) +
      rsiMomentumScore * (rsiMomentumWeight / 100) +
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
