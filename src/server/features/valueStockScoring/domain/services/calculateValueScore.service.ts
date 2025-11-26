import { z } from "zod";
import type { MarketAdjustments, ScoringConfig } from "../values/scoringConfig";

/**
 * 市場タイプ
 */
type MarketType = "prime" | "standard" | "growth" | "other";

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
 * 各指標のスコア（0〜100の連続値）
 */
export const indicatorScoreSchema = z.number().min(0).max(100);

export type IndicatorScore = z.infer<typeof indicatorScoreSchema>;

/**
 * 割安株スコアスキーマ
 */
export const valueScoreSchema = z.object({
  perScore: indicatorScoreSchema,
  pbrScore: indicatorScoreSchema,
  rsiScore: indicatorScoreSchema,
  priceRangeScore: indicatorScoreSchema,
  sectorScore: z.number(), // 0.00〜100.00 (将来の業種トレンドスコア用)
  totalScore: z.number(), // 0.0000〜1.0000
});

export type ValueScore = z.infer<typeof valueScoreSchema>;

/**
 * 市場名からMarketTypeを取得
 */
const getMarketType = (market: string | null): MarketType => {
  if (!market) return "other";
  if (market.includes("プライム")) return "prime";
  if (market.includes("スタンダード")) return "standard";
  if (market.includes("グロース")) return "growth";
  return "other";
};

/**
 * 値をmin〜maxの範囲にクリップ
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * PERスコアを計算（線形スケール 0-100）
 * 業種平均との比率で評価し、市場別補正を適用
 */
const calculatePERScore = (
  per: number | null,
  sectorAvgPer: number | null,
  config: ScoringConfig,
  marketAdjustments: MarketAdjustments,
): IndicatorScore => {
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
  return Math.round(adjusted);
};

/**
 * PBRスコアを計算（線形スケール 0-100）
 * 業種平均との比率で評価し、市場別補正を適用
 */
const calculatePBRScore = (
  pbr: number | null,
  sectorAvgPbr: number | null,
  config: ScoringConfig,
  marketAdjustments: MarketAdjustments,
): IndicatorScore => {
  if (pbr === null || pbr <= 0 || sectorAvgPbr === null || sectorAvgPbr <= 0) {
    return 0;
  }

  const ratio = (pbr / sectorAvgPbr) * 100;
  const { excellent, good } = config.pbrThresholds;

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
  const adjusted = clamp(baseScore * marketAdjustments.pbr, 0, 100);
  return Math.round(adjusted);
};

/**
 * RSIスコアを計算（線形スケール 0-100）
 * RSI値そのもので評価（市場別補正なし）
 */
const calculateRSIScore = (rsi: number | null, config: ScoringConfig): IndicatorScore => {
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

  return Math.round(clamp(score, 0, 100));
};

/**
 * 価格レンジスコアを計算（線形スケール 0-100）
 * 安値からの位置で評価し、市場別補正を適用
 */
const calculatePriceRangeScore = (
  currentPrice: number | null,
  priceHigh: number | null,
  priceLow: number | null,
  config: ScoringConfig,
  marketAdjustments: MarketAdjustments,
): IndicatorScore => {
  if (currentPrice === null || priceHigh === null || priceLow === null) {
    return 0;
  }

  if (priceHigh === priceLow) return 0;

  // 異常値チェック: 現在価格が期間レンジ外の場合
  if (currentPrice < priceLow || currentPrice > priceHigh) {
    console.warn(
      `[calculatePriceRangeScore] Price out of range: current=${currentPrice}, range=[${priceLow}, ${priceHigh}]`,
    );
    return 0;
  }

  const rangePosition = ((currentPrice - priceLow) / (priceHigh - priceLow)) * 100;
  const { bottom, low } = config.priceRangeThresholds;

  let baseScore: number;

  if (rangePosition <= bottom) {
    // 底値圏: 100点
    baseScore = 100;
  } else if (rangePosition <= low) {
    // 底値圏〜安値圏の間: 線形補間
    baseScore = 100 - ((rangePosition - bottom) / (low - bottom)) * 50;
  } else if (rangePosition <= 100) {
    // 安値圏〜高値圏の間: 線形補間
    baseScore = 50 - ((rangePosition - low) / (100 - low)) * 50;
  } else {
    baseScore = 0;
  }

  // 市場別補正を適用してクリップ
  const adjusted = clamp(baseScore * marketAdjustments.priceRange, 0, 100);
  return Math.round(adjusted);
};

/**
 * 業種相対スコアを計算（PERとPBRの平均）
 * TODO: 将来的には業種指数のMA13/MA26を使った業種トレンドスコアに置き換え
 */
const calculateSectorScore = (perScore: IndicatorScore, pbrScore: IndicatorScore): number => {
  return (perScore + pbrScore) / 2;
};

/**
 * 割安株スコアを計算する関数の型定義
 */
export type CalculateValueScore = (
  indicator: ScoringIndicator,
  config: ScoringConfig,
) => ValueScore;

/**
 * 割安株スコアを計算
 * 設定された重み付けに基づいて各指標のスコアを算出
 */
export const calculateValueScore: CalculateValueScore = (indicator, config) => {
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
  const totalScore =
    (perScore * (config.perWeight / 100) +
      pbrScore * (config.pbrWeight / 100) +
      rsiScore * (config.rsiWeight / 100) +
      priceRangeScore * (config.priceRangeWeight / 100)) /
    100;

  return valueScoreSchema.parse({
    perScore,
    pbrScore,
    rsiScore,
    priceRangeScore,
    sectorScore,
    totalScore,
  });
};
