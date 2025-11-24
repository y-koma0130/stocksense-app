import type { StockScore } from "../../aggregates/stockScore";
import { createStockScore } from "../../aggregates/stockScore";
import type { ScoringInput } from "../../entities/scoringInput";
import type { ScoringConfig } from "../../values/scoringConfig";
import { calculatePBRScore } from "./calculatePBRScore";
import { calculatePERScore } from "./calculatePERScore";
import { calculatePriceRangeScore } from "./calculatePriceRangeScore";
import { calculateRSIScore } from "./calculateRSIScore";
import { calculateSectorScore } from "./calculateSectorScore";

/**
 * 総合スコアを計算
 *
 * 前提: inputは既にバリデーション済みのエンティティ
 */
export const calculateTotalScore = (
  input: ScoringInput,
  config: ScoringConfig,
  scoreType: "mid_term" | "long_term",
): StockScore => {
  // 各スコアを計算（0-100点）
  const perScore = calculatePERScore(input.per, config);
  const pbrScore = calculatePBRScore(input.pbr, config);
  const rsiScore = calculateRSIScore(input.rsi, config);
  const priceRangeScore = calculatePriceRangeScore(
    input.currentPrice,
    input.fiftyTwoWeekHigh,
    input.fiftyTwoWeekLow,
    config,
  );
  const sectorScore = calculateSectorScore(
    input.per,
    input.pbr,
    input.sectorAvgPer,
    input.sectorAvgPbr,
    config,
  );

  // 重み付け合計を計算（0-1の範囲に正規化）
  const totalScore =
    (perScore * config.perWeight +
      pbrScore * config.pbrWeight +
      rsiScore * config.rsiWeight +
      priceRangeScore * config.priceRangeWeight +
      sectorScore * config.sectorWeight) /
    10000; // 100点満点 × 重み合計100 = 10000で割って0-1に

  // 集約生成（バリデーション付き）
  return createStockScore(
    input,
    {
      perScore,
      pbrScore,
      rsiScore,
      priceRangeScore,
      sectorScore,
      totalScore: Number(totalScore.toFixed(4)),
    },
    scoreType,
  );
};
