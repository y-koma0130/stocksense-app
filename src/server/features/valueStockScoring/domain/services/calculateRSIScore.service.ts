import { clamp } from "../utils/clamp";
import { type IndicatorScore, indicatorScoreSchema } from "../values/indicatorScore";
import type { ScoringConfig } from "../values/scoringConfig";

/**
 * RSIスコア計算関数の型定義
 */
export type CalculateRSIScore = (rsi: number | null, config: ScoringConfig) => IndicatorScore;

/**
 * RSIスコアを計算（線形スケール 0-100）
 * RSI値そのもので評価（市場別補正なし）
 */
export const calculateRSIScore: CalculateRSIScore = (rsi, config) => {
  if (rsi === null) return 0;

  const { oversold, neutral } = config.rsiThresholds;

  let score: number;

  if (rsi <= oversold) {
    // 売られすぎ: 100点
    score = 100;
  } else if (rsi <= neutral) {
    // 売られすぎ〜中立の間: 線形補間
    score = 100 - ((rsi - oversold) / (neutral - oversold)) * 50;
  } else if (rsi <= 70) {
    // 中立〜買われすぎの間: 線形補間
    score = 50 - ((rsi - neutral) / (70 - neutral)) * 50;
  } else {
    // 買われすぎ: 0点
    score = 0;
  }

  return indicatorScoreSchema.parse(Math.round(clamp(score, 0, 100)));
};
