import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";
import type { MarketAdjustments, ScoringConfig } from "../values/scoringConfig";

/**
 * PERスコア計算関数の型定義
 */
export type CalculatePERScore = (
  per: number | null,
  sectorAvgPer: number | null,
  config: ScoringConfig,
  marketAdjustments: MarketAdjustments,
) => IndicatorScore;

/**
 * PERスコアを計算（線形スケール 0-100）
 * 業種平均との比率で評価し、市場別補正を適用
 */
export const calculatePERScore: CalculatePERScore = (
  per,
  sectorAvgPer,
  config,
  marketAdjustments,
) => {
  if (per === null || per <= 0 || sectorAvgPer === null || sectorAvgPer <= 0) {
    return 0;
  }

  const ratio = (per / sectorAvgPer) * 100; // パーセント表示
  const { excellent, good } = config.perThresholds;

  let baseScore: number;

  if (ratio <= excellent) {
    // 優良ゾーン: 100点
    baseScore = 100;
  } else if (ratio <= good) {
    // 優良〜良好の間: 線形補間
    baseScore = 100 - ((ratio - excellent) / (good - excellent)) * 50;
  } else if (ratio <= 150) {
    // 良好〜標準の間: 線形補間
    baseScore = 50 - ((ratio - good) / (150 - good)) * 50;
  } else {
    // 割高: 0点
    baseScore = 0;
  }

  // 市場別補正を適用してクリップ
  const adjusted = clamp(baseScore * marketAdjustments.per, 0, 100);
  return indicatorScoreSchema.parse(Math.round(adjusted));
};
