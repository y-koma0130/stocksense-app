import { calculatePricePosition } from "../yahoo-finance/historical";
import type { ScoringConfig, ScoringInput, ScoringResult } from "./types";

/**
 * PERスコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - PER 10以下: 100点
 * - PER 10-15: 75点
 * - PER 15-20: 50点
 * - PER 20-25: 25点
 * - PER 25超: 0点
 * - PERがnullの場合: 0点
 */
function calculatePERScore(per: number | null, config: ScoringConfig): number {
  if (per === null || per <= 0) {
    return 0;
  }

  if (per <= config.perThresholds.veryLow) {
    return 100;
  }
  if (per <= config.perThresholds.low) {
    return 75;
  }
  if (per <= 20) {
    return 50;
  }
  if (per <= 25) {
    return 25;
  }
  return 0;
}

/**
 * PBRスコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - PBR 0.8以下: 100点
 * - PBR 0.8-1.0: 75点
 * - PBR 1.0-1.5: 50点
 * - PBR 1.5-2.0: 25点
 * - PBR 2.0超: 0点
 * - PBRがnullの場合: 0点
 */
function calculatePBRScore(pbr: number | null, config: ScoringConfig): number {
  if (pbr === null || pbr <= 0) {
    return 0;
  }

  if (pbr <= config.pbrThresholds.veryLow) {
    return 100;
  }
  if (pbr <= config.pbrThresholds.low) {
    return 75;
  }
  if (pbr <= 1.5) {
    return 50;
  }
  if (pbr <= 2.0) {
    return 25;
  }
  return 0;
}

/**
 * RSIスコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - RSI 30以下（売られすぎ）: 100点
 * - RSI 30-40: 75点
 * - RSI 40-50: 50点
 * - RSI 50-60: 25点
 * - RSI 60超: 0点
 * - RSIがnullの場合: 0点
 */
function calculateRSIScore(rsi: number | null, config: ScoringConfig): number {
  if (rsi === null) {
    return 0;
  }

  if (rsi <= config.rsiThresholds.oversold) {
    return 100;
  }
  if (rsi <= config.rsiThresholds.moderate) {
    return 75;
  }
  if (rsi <= 50) {
    return 50;
  }
  if (rsi <= 60) {
    return 25;
  }
  return 0;
}

/**
 * 価格レンジスコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - 安値から30%以内: 100点
 * - 安値から30-40%: 75点
 * - 安値から40-50%: 50点
 * - 安値から50-60%: 25点
 * - それ以上: 0点
 */
function calculatePriceRangeScore(
  currentPrice: number,
  fiftyTwoWeekHigh: number,
  fiftyTwoWeekLow: number,
  config: ScoringConfig,
): number {
  const position = calculatePricePosition(currentPrice, fiftyTwoWeekHigh, fiftyTwoWeekLow);

  if (position <= config.priceRangeThresholds.veryLow) {
    return 100;
  }
  if (position <= config.priceRangeThresholds.low) {
    return 75;
  }
  if (position <= 0.5) {
    return 50;
  }
  if (position <= 0.6) {
    return 25;
  }
  return 0;
}

/**
 * 業種比較スコアを計算（0-100点）
 *
 * スコアリングロジック:
 * - PER/PBRが業種平均の70%以下: 100点
 * - 70-85%: 75点
 * - 85-100%: 50点
 * - 100-115%: 25点
 * - 115%超: 0点
 */
function calculateSectorScore(
  per: number | null,
  pbr: number | null,
  sectorAvgPer: number | null,
  sectorAvgPbr: number | null,
  config: ScoringConfig,
): number {
  let perSectorScore = 0;
  let pbrSectorScore = 0;
  let validScores = 0;

  // PER業種比較
  if (per !== null && sectorAvgPer !== null && sectorAvgPer > 0) {
    const perRatio = per / sectorAvgPer;
    if (perRatio <= config.sectorThresholds.muchLower) {
      perSectorScore = 100;
    } else if (perRatio <= config.sectorThresholds.lower) {
      perSectorScore = 75;
    } else if (perRatio <= 1.0) {
      perSectorScore = 50;
    } else if (perRatio <= 1.15) {
      perSectorScore = 25;
    }
    validScores++;
  }

  // PBR業種比較
  if (pbr !== null && sectorAvgPbr !== null && sectorAvgPbr > 0) {
    const pbrRatio = pbr / sectorAvgPbr;
    if (pbrRatio <= config.sectorThresholds.muchLower) {
      pbrSectorScore = 100;
    } else if (pbrRatio <= config.sectorThresholds.lower) {
      pbrSectorScore = 75;
    } else if (pbrRatio <= 1.0) {
      pbrSectorScore = 50;
    } else if (pbrRatio <= 1.15) {
      pbrSectorScore = 25;
    }
    validScores++;
  }

  // 平均を返す（どちらかしかない場合はそれを返す）
  if (validScores === 0) {
    return 0;
  }
  return (perSectorScore + pbrSectorScore) / validScores;
}

/**
 * 総合スコアを計算
 *
 * @param input - スコアリング入力データ
 * @param config - スコアリング設定
 * @param scoreType - スコアタイプ（mid_term or long_term）
 * @returns スコアリング結果
 */
export function calculateScore(
  input: ScoringInput,
  config: ScoringConfig,
  scoreType: "mid_term" | "long_term",
): ScoringResult {
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

  return {
    stockId: input.stockId,
    tickerSymbol: input.tickerSymbol,
    scoreType,
    perScore,
    pbrScore,
    rsiScore,
    priceRangeScore,
    sectorScore,
    totalScore: Number(totalScore.toFixed(4)),
  };
}
