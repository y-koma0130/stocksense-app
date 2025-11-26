import type { IndicatorDto } from "../../application/dto/indicator.dto";
import type { ScoringConfig } from "../values/scoringConfig";
import { calculateValueScore, type ValueScore } from "./calculateValueScore.service";

/**
 * スコア付き指標の型
 */
export type ScoredIndicator<T extends IndicatorDto> = T & { valueScore: ValueScore };

/**
 * スコア計算関数の型定義
 */
export type CalculateScores = <T extends IndicatorDto>(
  indicators: readonly T[],
  config: ScoringConfig,
) => ScoredIndicator<T>[];

/**
 * 全ての指標にスコアを付与する
 * 各指標に対してドメインサービスでスコアを計算し、結果を付与する
 */
export const calculateScores: CalculateScores = (indicators, config) => {
  return indicators.map((indicator) => ({
    ...indicator,
    valueScore: calculateValueScore(indicator, config),
  }));
};
