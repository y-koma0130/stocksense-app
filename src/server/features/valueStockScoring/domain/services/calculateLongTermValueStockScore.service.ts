import { getMarketType } from "@/constants/marketTypes";
import type { LongTermIndicatorDto } from "../../application/dto/indicator.dto";
import { type ValueStockScore, valueStockScoreSchema } from "../entities/valueStockScore";
import { indicatorScoreSchema } from "../values/indicatorScore";
import { LONG_TERM_CONFIG } from "../values/scoringConfig";
import { totalScoreSchema } from "../values/totalScore";
import { calculateEpsGrowthScore } from "./calculateEpsGrowthScore.service";
import { calculatePBRScore } from "./calculatePBRScore.service";
import { calculatePERScore } from "./calculatePERScore.service";
import { calculatePriceRangeScore } from "./calculatePriceRangeScore.service";
import { calculateROEScore } from "./calculateROEScore.service";
import { calculateRSIScore } from "./calculateRSIScore.service";
import { calculateSectorScore } from "./calculateSectorScore.service";
import { calculateTagScore } from "./calculateTagScore.service";

/**
 * 長期スコア計算用の入力データ
 *
 * indicatorに加え、タグスコア計算用の情報を含む
 */
export type LongTermScoreInput = Readonly<{
  indicator: LongTermIndicatorDto;
  // タグスコア計算用（全市場で使用）
  stockMacroTagIds: readonly string[];
  stockThemeTagIds: readonly string[];
  favorableMacroTagIds: readonly string[];
  favorableThemeTagIds: readonly string[];
  unfavorableMacroTagIds: readonly string[];
  unfavorableThemeTagIds: readonly string[];
}>;

/**
 * 長期スコア計算関数の型定義
 */
export type CalculateLongTermValueStockScore = (input: LongTermScoreInput) => ValueStockScore;

/**
 * 長期割安株スコアを計算
 *
 * 市場別重み配分:
 * - プライム: PER22 + PBR18 + RSI10 + 価格10 + EPS18 + タグ15 + ROE7 = 100%
 * - スタンダード: PER25 + PBR20 + RSI10 + 価格10 + EPS15 + タグ13 + ROE7 = 100%
 * - グロース: PER8 + PBR5 + RSI10 + 価格12 + EPS30 + タグ25 + ROE10 = 100%
 * - その他: プライムと同じ
 */
export const calculateLongTermValueStockScore: CalculateLongTermValueStockScore = (input) => {
  const { indicator } = input;
  const config = LONG_TERM_CONFIG;
  const marketType = getMarketType(indicator.market);
  const weights = config.weights[marketType];

  // 各スコアを計算
  const perScore = calculatePERScore(indicator.per, indicator.sectorAvgPer, config.perThresholds);

  const pbrScore = calculatePBRScore(
    indicator.pbr,
    indicator.sectorAvgPbr,
    indicator.roe,
    config.pbrThresholds,
    config.pbrPenaltyThresholds,
  );

  const rsiScore = calculateRSIScore(indicator.rsi, config.rsiThresholds);

  const priceRangeScore = calculatePriceRangeScore(
    indicator.currentPrice,
    indicator.priceHigh,
    indicator.priceLow,
    config.priceRangeThresholds,
  );

  // 長期専用スコア
  const epsGrowthScore = indicatorScoreSchema.parse(
    Math.round(calculateEpsGrowthScore(indicator.epsLatest, indicator.eps3yAgo)),
  );

  // タグスコア（長期は全市場で使用、テーマ+マクロ合成）
  const tagScore = calculateTagScore(
    {
      stockMacroTagIds: input.stockMacroTagIds,
      stockThemeTagIds: input.stockThemeTagIds,
      favorableMacroTagIds: input.favorableMacroTagIds,
      favorableThemeTagIds: input.favorableThemeTagIds,
      unfavorableMacroTagIds: input.unfavorableMacroTagIds,
      unfavorableThemeTagIds: input.unfavorableThemeTagIds,
    },
    false, // useOnlyTheme = false（長期はテーマ+マクロ合成）
  );

  // ROEスコア
  const roeScore = calculateROEScore(indicator.roe, config.roeThresholds);

  const sectorScore = calculateSectorScore(perScore, pbrScore);

  // 重み付けでトータルスコア算出
  const weightedScore =
    perScore * weights.per +
    pbrScore * weights.pbr +
    rsiScore * weights.rsi +
    priceRangeScore * weights.priceRange +
    epsGrowthScore * weights.epsGrowth +
    tagScore * weights.tagScore +
    roeScore * weights.roe;

  // 合計100で割って0-1に正規化
  const totalScoreValue = weightedScore / 10000;
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
