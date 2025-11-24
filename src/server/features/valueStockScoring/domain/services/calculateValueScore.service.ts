import { z } from "zod";

/**
 * 市場タイプ
 */
type MarketType = "プライム" | "スタンダード" | "グロース" | "other";

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
  week52High: number | null;
  week52Low: number | null;
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
  sectorScore: z.number(), // 0.00〜100.00
  totalScore: z.number(), // 0.0000〜1.0000
});

export type ValueScore = z.infer<typeof valueScoreSchema>;

/**
 * 市場名からMarketTypeを取得
 */
const getMarketType = (market: string | null): MarketType => {
  if (!market) return "other";
  if (market.includes("プライム")) return "プライム";
  if (market.includes("スタンダード")) return "スタンダード";
  if (market.includes("グロース")) return "グロース";
  return "other";
};

/**
 * 市場別の補正係数
 */
const MARKET_ADJUSTMENTS = {
  プライム: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
  スタンダード: { per: 1.05, pbr: 1.0, priceRange: 1.05 },
  グロース: { per: 1.1, pbr: 0.8, priceRange: 0.9 },
  other: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
} as const;

/**
 * PERスコアを計算（10段階）
 * 業種平均との比率で評価
 */
const calculatePERScore = (
  per: number | null,
  sectorAvgPer: number | null,
  marketType: MarketType,
): IndicatorScore => {
  if (per === null || per <= 0 || sectorAvgPer === null || sectorAvgPer <= 0) {
    return 0;
  }

  const ratio = (per / sectorAvgPer) * 100; // パーセント表示
  let baseScore: number;

  if (ratio <= 65) baseScore = 100;
  else if (ratio <= 75) baseScore = 90;
  else if (ratio <= 85) baseScore = 80;
  else if (ratio <= 95) baseScore = 70;
  else if (ratio <= 105) baseScore = 60;
  else if (ratio <= 115) baseScore = 50;
  else if (ratio <= 125) baseScore = 40;
  else if (ratio <= 140) baseScore = 30;
  else if (ratio <= 160) baseScore = 20;
  else baseScore = 0;

  // 市場別補正（上限100）
  const adjusted = Math.min(100, baseScore * MARKET_ADJUSTMENTS[marketType].per);
  return Math.round(adjusted);
};

/**
 * PBRスコアを計算（10段階）
 * 業種平均との比率で評価
 */
const calculatePBRScore = (
  pbr: number | null,
  sectorAvgPbr: number | null,
  marketType: MarketType,
): IndicatorScore => {
  if (pbr === null || pbr <= 0 || sectorAvgPbr === null || sectorAvgPbr <= 0) {
    return 0;
  }

  const ratio = (pbr / sectorAvgPbr) * 100;
  let baseScore: number;

  if (ratio <= 65) baseScore = 100;
  else if (ratio <= 75) baseScore = 90;
  else if (ratio <= 85) baseScore = 80;
  else if (ratio <= 95) baseScore = 70;
  else if (ratio <= 105) baseScore = 60;
  else if (ratio <= 115) baseScore = 50;
  else if (ratio <= 125) baseScore = 40;
  else if (ratio <= 140) baseScore = 30;
  else if (ratio <= 160) baseScore = 20;
  else baseScore = 0;

  // 市場別補正（上限100）
  const adjusted = Math.min(100, baseScore * MARKET_ADJUSTMENTS[marketType].pbr);
  return Math.round(adjusted);
};

/**
 * RSIスコアを計算（10段階）
 * RSI値そのもので評価（市場別補正なし）
 */
const calculateRSIScore = (rsi: number | null): IndicatorScore => {
  if (rsi === null) return 0;

  if (rsi <= 25) return 100;
  if (rsi <= 30) return 90;
  if (rsi <= 35) return 80;
  if (rsi <= 40) return 70;
  if (rsi <= 45) return 60;
  if (rsi <= 50) return 50;
  if (rsi <= 55) return 40;
  if (rsi <= 60) return 30;
  if (rsi <= 70) return 15;
  return 0;
};

/**
 * 価格レンジスコアを計算（10段階）
 * 52週の安値からの位置で評価
 */
const calculatePriceRangeScore = (
  currentPrice: number | null,
  week52High: number | null,
  week52Low: number | null,
  marketType: MarketType,
): IndicatorScore => {
  if (currentPrice === null || week52High === null || week52Low === null) {
    return 0;
  }

  if (week52High === week52Low) return 0;

  const rangePosition = ((currentPrice - week52Low) / (week52High - week52Low)) * 100;
  let baseScore: number;

  if (rangePosition <= 10) baseScore = 100;
  else if (rangePosition <= 20) baseScore = 90;
  else if (rangePosition <= 30) baseScore = 80;
  else if (rangePosition <= 40) baseScore = 70;
  else if (rangePosition <= 50) baseScore = 60;
  else if (rangePosition <= 60) baseScore = 50;
  else if (rangePosition <= 70) baseScore = 30;
  else if (rangePosition <= 80) baseScore = 15;
  else if (rangePosition <= 90) baseScore = 5;
  else baseScore = 0;

  // 市場別補正（上限100）
  const adjusted = Math.min(100, baseScore * MARKET_ADJUSTMENTS[marketType].priceRange);
  return Math.round(adjusted);
};

/**
 * 業種相対スコアを計算（PERとPBRの平均）
 */
const calculateSectorScore = (perScore: IndicatorScore, pbrScore: IndicatorScore): number => {
  return (perScore + pbrScore) / 2;
};

/**
 * 割安株スコアを計算する関数の型定義
 */
export type CalculateValueScore = (indicator: ScoringIndicator) => ValueScore;

/**
 * 割安株スコアを計算
 * - 割安性: PER (30%), PBR (30%)
 * - テクニカル: RSI (20%)
 * - 価格レンジ: 価格位置 (20%)
 */
export const calculateValueScore: CalculateValueScore = (indicator) => {
  const marketType = getMarketType(indicator.market);

  const perScore = calculatePERScore(indicator.per, indicator.sectorAvgPer, marketType);
  const pbrScore = calculatePBRScore(indicator.pbr, indicator.sectorAvgPbr, marketType);
  const rsiScore = calculateRSIScore(indicator.rsi);
  const priceRangeScore = calculatePriceRangeScore(
    indicator.currentPrice,
    indicator.week52High,
    indicator.week52Low,
    marketType,
  );

  const sectorScore = calculateSectorScore(perScore, pbrScore);

  // 重み付け平均でトータルスコア算出
  const totalScore =
    (perScore * 0.3 + pbrScore * 0.3 + rsiScore * 0.2 + priceRangeScore * 0.2) / 100;

  return valueScoreSchema.parse({
    perScore,
    pbrScore,
    rsiScore,
    priceRangeScore,
    sectorScore,
    totalScore,
  });
};
