import { z } from "zod";

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
}>;

/**
 * 各指標のスコア（0, 25, 50, 75, 100）
 */
export const indicatorScoreSchema = z.union([
  z.literal(0),
  z.literal(25),
  z.literal(50),
  z.literal(75),
  z.literal(100),
]);

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
 * PERスコアを計算
 * - PERが業種平均の70%以下: 100点
 * - 70〜85%: 75点
 * - 85〜100%: 50点
 * - 100〜115%: 25点
 * - 115%超: 0点
 */
const calculatePERScore = (per: number | null, sectorAvgPer: number | null): IndicatorScore => {
  if (per === null || per <= 0 || sectorAvgPer === null || sectorAvgPer <= 0) {
    return 0;
  }

  const ratio = per / sectorAvgPer;

  if (ratio <= 0.7) return 100;
  if (ratio <= 0.85) return 75;
  if (ratio <= 1.0) return 50;
  if (ratio <= 1.15) return 25;
  return 0;
};

/**
 * PBRスコアを計算
 * - PBRが業種平均の70%以下: 100点
 * - 70〜85%: 75点
 * - 85〜100%: 50点
 * - 100〜115%: 25点
 * - 115%超: 0点
 */
const calculatePBRScore = (pbr: number | null, sectorAvgPbr: number | null): IndicatorScore => {
  if (pbr === null || pbr <= 0 || sectorAvgPbr === null || sectorAvgPbr <= 0) {
    return 0;
  }

  const ratio = pbr / sectorAvgPbr;

  if (ratio <= 0.7) return 100;
  if (ratio <= 0.85) return 75;
  if (ratio <= 1.0) return 50;
  if (ratio <= 1.15) return 25;
  return 0;
};

/**
 * RSIスコアを計算
 * - 30以下（売られすぎ）: 100点
 * - 30〜40: 75点
 * - 40〜50: 50点
 * - 50〜60: 25点
 * - 60以上: 0点
 */
const calculateRSIScore = (rsi: number | null): IndicatorScore => {
  if (rsi === null) return 0;

  if (rsi <= 30) return 100;
  if (rsi <= 40) return 75;
  if (rsi <= 50) return 50;
  if (rsi <= 60) return 25;
  return 0;
};

/**
 * 価格レンジスコアを計算
 * - 52週安値から25%以内: 100点
 * - 25〜40%: 75点
 * - 40〜60%: 50点
 * - 60〜75%: 25点
 * - 75%以上: 0点
 */
const calculatePriceRangeScore = (
  currentPrice: number | null,
  week52High: number | null,
  week52Low: number | null,
): IndicatorScore => {
  if (currentPrice === null || week52High === null || week52Low === null) {
    return 0;
  }

  if (week52High === week52Low) return 0;

  const rangePosition = (currentPrice - week52Low) / (week52High - week52Low);

  if (rangePosition <= 0.25) return 100;
  if (rangePosition <= 0.4) return 75;
  if (rangePosition <= 0.6) return 50;
  if (rangePosition <= 0.75) return 25;
  return 0;
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
  const perScore = calculatePERScore(indicator.per, indicator.sectorAvgPer);
  const pbrScore = calculatePBRScore(indicator.pbr, indicator.sectorAvgPbr);
  const rsiScore = calculateRSIScore(indicator.rsi);
  const priceRangeScore = calculatePriceRangeScore(
    indicator.currentPrice,
    indicator.week52High,
    indicator.week52Low,
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
