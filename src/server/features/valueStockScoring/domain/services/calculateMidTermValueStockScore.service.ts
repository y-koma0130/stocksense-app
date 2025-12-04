import { getMarketType } from "@/constants/marketTypes";
import type { MidTermIndicatorDto } from "../../application/dto/indicator.dto";
import { type ValueStockScore, valueStockScoreSchema } from "../entities/valueStockScore";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";
import { MID_TERM_CONFIG } from "../values/scoringConfig";
import { totalScoreSchema } from "../values/totalScore";
import { calculateEpsGrowthScore } from "./calculateEpsGrowthScore.service";
import { calculatePBRScore } from "./calculatePBRScore.service";
import { calculatePERScore } from "./calculatePERScore.service";
import { calculatePriceRangeScore } from "./calculatePriceRangeScore.service";
import { calculateRSIMomentumScore } from "./calculateRSIMomentumScore.service";
import { calculateRSIScore } from "./calculateRSIScore.service";
import { calculateSectorScore } from "./calculateSectorScore.service";
import { calculateTagScore } from "./calculateTagScore.service";
import { calculateVolumeSurgeScore } from "./calculateVolumeSurgeScore.service";

/**
 * 中期スコア計算用の入力データ
 *
 * indicatorに加え、タグスコア計算用の情報を含む
 */
export type MidTermScoreInput = Readonly<{
  indicator: MidTermIndicatorDto;
  // タグスコア計算用（グロース市場のみ使用）
  stockMacroTagIds: readonly string[];
  stockThemeTagIds: readonly string[];
  favorableMacroTagIds: readonly string[];
  favorableThemeTagIds: readonly string[];
  unfavorableMacroTagIds: readonly string[];
  unfavorableThemeTagIds: readonly string[];
  // EPS成長率計算用（グロース市場のみ使用）
  epsLatest: number | null;
  eps3yAgo: number | null;
}>;

/**
 * 中期スコア計算関数の型定義
 */
export type CalculateMidTermValueStockScore = (input: MidTermScoreInput) => ValueStockScore;

/**
 * 中期割安株スコアを計算
 *
 * 市場別重み配分:
 * - プライム: PER24 + PBR18 + RSI16 + 価格12 + RSIモメンタム18 + 出来高12 = 100%
 * - スタンダード: PER26 + PBR20 + RSI16 + 価格12 + RSIモメンタム16 + 出来高10 = 100%
 * - グロース: PER15 + PBR5 + RSI18 + 価格15 + RSIモメンタム17 + 出来高10 + EPS12 + タグ8 = 100%
 * - その他: プライムと同じ
 */
export const calculateMidTermValueStockScore: CalculateMidTermValueStockScore = (input) => {
  const { indicator } = input;
  const config = MID_TERM_CONFIG;
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

  // 中期専用スコア
  const rsiMomentumScore = calculateRSIMomentumScore(indicator.rsiShort, indicator.rsi);
  const volumeSurgeScore = calculateVolumeSurgeScore(
    indicator.avgVolumeShort,
    indicator.avgVolumeLong,
  );

  // グロース市場のみEPS成長率とタグスコアを計算
  let epsGrowthScore: IndicatorScore = indicatorScoreSchema.parse(0);
  let tagScore: IndicatorScore = indicatorScoreSchema.parse(0);

  if (marketType === "growth") {
    // EPS成長率スコア
    epsGrowthScore = indicatorScoreSchema.parse(
      Math.round(calculateEpsGrowthScore(input.epsLatest, input.eps3yAgo)),
    );

    // タグスコア（中期はテーマタグのみ使用）
    tagScore = calculateTagScore(
      {
        stockMacroTagIds: input.stockMacroTagIds,
        stockThemeTagIds: input.stockThemeTagIds,
        favorableMacroTagIds: input.favorableMacroTagIds,
        favorableThemeTagIds: input.favorableThemeTagIds,
        unfavorableMacroTagIds: input.unfavorableMacroTagIds,
        unfavorableThemeTagIds: input.unfavorableThemeTagIds,
      },
      true, // useOnlyTheme = true（中期はテーマタグのみ）
    );
  }

  const sectorScore = calculateSectorScore(perScore, pbrScore);

  // 重み付けでトータルスコア算出
  const weightedScore =
    perScore * weights.per +
    pbrScore * weights.pbr +
    rsiScore * weights.rsi +
    priceRangeScore * weights.priceRange +
    rsiMomentumScore * weights.rsiMomentum +
    volumeSurgeScore * weights.volumeSurge +
    epsGrowthScore * weights.epsGrowth +
    tagScore * weights.tagScore;

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
