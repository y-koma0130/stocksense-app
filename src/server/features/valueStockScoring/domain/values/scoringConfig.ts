import { z } from "zod";

/**
 * 市場タイプ
 */
export type MarketType = "prime" | "standard" | "growth" | "other";

/**
 * 中期スコアの重み配分スキーマ
 */
export const midTermWeightsSchema = z.object({
  per: z.number().min(0).max(100),
  pbr: z.number().min(0).max(100),
  rsi: z.number().min(0).max(100),
  priceRange: z.number().min(0).max(100),
  rsiMomentum: z.number().min(0).max(100),
  volumeSurge: z.number().min(0).max(100),
  epsGrowth: z.number().min(0).max(100), // グロースのみ使用
  tagScore: z.number().min(0).max(100), // グロースのみ使用
});

export type MidTermWeights = z.infer<typeof midTermWeightsSchema>;

/**
 * 長期スコアの重み配分スキーマ
 */
export const longTermWeightsSchema = z.object({
  per: z.number().min(0).max(100),
  pbr: z.number().min(0).max(100),
  rsi: z.number().min(0).max(100),
  priceRange: z.number().min(0).max(100),
  epsGrowth: z.number().min(0).max(100),
  tagScore: z.number().min(0).max(100),
  roe: z.number().min(0).max(100),
});

export type LongTermWeights = z.infer<typeof longTermWeightsSchema>;

/**
 * PER/PBRの閾値（業種平均比のパーセント値）
 */
export const ratioThresholdsSchema = z.object({
  excellent: z.number(), // 優良（最高スコア）の閾値
  good: z.number(), // 良好の閾値
});

export type RatioThresholds = z.infer<typeof ratioThresholdsSchema>;

/**
 * PBRの絶対値ペナルティ閾値
 */
export const pbrPenaltyThresholdsSchema = z.object({
  severelyLow: z.number(), // 極端に低い閾値（0.3倍未満）
  low: z.number(), // 低い閾値（0.5倍未満）
  lowRoeThreshold: z.number(), // 低PBR+低ROEのROE閾値（5%）
  severePenalty: z.number(), // 極端に低い場合のペナルティ係数（0.7）
  lowPenalty: z.number(), // 低い+低ROEの場合のペナルティ係数（0.8）
});

export type PbrPenaltyThresholds = z.infer<typeof pbrPenaltyThresholdsSchema>;

/**
 * RSIの閾値
 */
export const rsiThresholdsSchema = z.object({
  oversold: z.number(), // 売られすぎ
  neutral: z.number(), // 中立
});

export type RsiThresholds = z.infer<typeof rsiThresholdsSchema>;

/**
 * 価格レンジの閾値（パーセント値）
 */
export const priceRangeThresholdsSchema = z.object({
  bottom: z.number(), // 底値圏
  low: z.number(), // 安値圏
});

export type PriceRangeThresholds = z.infer<typeof priceRangeThresholdsSchema>;

/**
 * EPS成長率の閾値
 */
export const epsGrowthThresholdsSchema = z.object({
  lowGrowth: z.number(), // 低成長の閾値（10%）
  highGrowth: z.number(), // 高成長の閾値（20%）
});

export type EpsGrowthThresholds = z.infer<typeof epsGrowthThresholdsSchema>;

/**
 * ROEの閾値
 */
export const roeThresholdsSchema = z.object({
  low: z.number(), // 低ROE閾値（5%）
  medium: z.number(), // 中程度閾値（8%）
  high: z.number(), // 高ROE閾値（15%）
});

export type RoeThresholds = z.infer<typeof roeThresholdsSchema>;

/**
 * 中期スコアリング設定のZodスキーマ
 */
export const midTermScoringConfigSchema = z.object({
  // 市場別の重み配分
  weights: z.object({
    prime: midTermWeightsSchema,
    standard: midTermWeightsSchema,
    growth: midTermWeightsSchema,
    other: midTermWeightsSchema,
  }),

  // 各指標の閾値
  perThresholds: ratioThresholdsSchema,
  pbrThresholds: ratioThresholdsSchema,
  pbrPenaltyThresholds: pbrPenaltyThresholdsSchema,
  rsiThresholds: rsiThresholdsSchema,
  priceRangeThresholds: priceRangeThresholdsSchema,
  epsGrowthThresholds: epsGrowthThresholdsSchema,
});

export type MidTermScoringConfig = z.infer<typeof midTermScoringConfigSchema>;

/**
 * 長期スコアリング設定のZodスキーマ
 */
export const longTermScoringConfigSchema = z.object({
  // 市場別の重み配分
  weights: z.object({
    prime: longTermWeightsSchema,
    standard: longTermWeightsSchema,
    growth: longTermWeightsSchema,
    other: longTermWeightsSchema,
  }),

  // 各指標の閾値
  perThresholds: ratioThresholdsSchema,
  pbrThresholds: ratioThresholdsSchema,
  pbrPenaltyThresholds: pbrPenaltyThresholdsSchema,
  rsiThresholds: rsiThresholdsSchema,
  priceRangeThresholds: priceRangeThresholdsSchema,
  epsGrowthThresholds: epsGrowthThresholdsSchema,
  roeThresholds: roeThresholdsSchema,
});

export type LongTermScoringConfig = z.infer<typeof longTermScoringConfigSchema>;

/**
 * 共通の閾値設定
 */
const COMMON_THRESHOLDS = {
  perThresholds: {
    excellent: 70, // 70%以下で満点
    good: 100, // 100%以下で中程度
  },
  pbrThresholds: {
    excellent: 70, // 70%以下で満点（40%未満は警告）
    good: 100, // 100%以下で中程度
  },
  pbrPenaltyThresholds: {
    severelyLow: 0.3, // PBR 0.3倍未満
    low: 0.5, // PBR 0.5倍未満
    lowRoeThreshold: 5, // ROE 5%未満
    severePenalty: 0.7, // 30%減点
    lowPenalty: 0.8, // 20%減点
  },
  rsiThresholds: {
    oversold: 30, // 30以下で売られすぎ
    neutral: 50, // 50以下で中立
  },
  priceRangeThresholds: {
    bottom: 20, // 20%以下で底値圏
    low: 40, // 40%以下で安値圏
  },
  epsGrowthThresholds: {
    lowGrowth: 10, // 10%以下で低成長
    highGrowth: 20, // 20%以上で高成長
  },
};

/**
 * 中期（週次）スコアリングの設定
 *
 * 市場別の重み配分:
 * - プライム: バリュエーション重視（PER/PBR合計42%）
 * - スタンダード: バリュエーション重視（PER/PBR合計46%）
 * - グロース: 成長×テーマ重視（EPS12% + タグ8%）、PER/PBR軽視（20%）
 */
export const MID_TERM_CONFIG: MidTermScoringConfig = {
  weights: {
    // プライム: 合計100%
    prime: {
      per: 24,
      pbr: 18,
      rsi: 16,
      priceRange: 12,
      rsiMomentum: 18,
      volumeSurge: 12,
      epsGrowth: 0, // 使用しない
      tagScore: 0, // 使用しない
    },
    // スタンダード: 合計100%
    standard: {
      per: 26,
      pbr: 20,
      rsi: 16,
      priceRange: 12,
      rsiMomentum: 16,
      volumeSurge: 10,
      epsGrowth: 0, // 使用しない
      tagScore: 0, // 使用しない
    },
    // グロース: 合計100%（EPS成長率・タグスコア使用）
    growth: {
      per: 15,
      pbr: 5,
      rsi: 18,
      priceRange: 15,
      rsiMomentum: 17,
      volumeSurge: 10,
      epsGrowth: 12, // グロースのみ
      tagScore: 8, // グロースのみ
    },
    // その他: プライムと同じ
    other: {
      per: 24,
      pbr: 18,
      rsi: 16,
      priceRange: 12,
      rsiMomentum: 18,
      volumeSurge: 12,
      epsGrowth: 0,
      tagScore: 0,
    },
  },
  ...COMMON_THRESHOLDS,
};

/**
 * 長期（月次）スコアリングの設定
 *
 * 市場別の重み配分:
 * - プライム: バランス型（バリュエーション40% + 成長18% + タグ15% + ROE7%）
 * - スタンダード: バリュエーション重視（PER/PBR合計45%）
 * - グロース: 成長×テーマ最重視（EPS30% + タグ25%）、PER/PBR軽視（13%）
 */
export const LONG_TERM_CONFIG: LongTermScoringConfig = {
  weights: {
    // プライム: 合計100%
    prime: {
      per: 22,
      pbr: 18,
      rsi: 10,
      priceRange: 10,
      epsGrowth: 18,
      tagScore: 15,
      roe: 7,
    },
    // スタンダード: 合計100%
    standard: {
      per: 25,
      pbr: 20,
      rsi: 10,
      priceRange: 10,
      epsGrowth: 15,
      tagScore: 13,
      roe: 7,
    },
    // グロース: 合計100%（成長×テーマ最重視）
    growth: {
      per: 8,
      pbr: 5,
      rsi: 10,
      priceRange: 12,
      epsGrowth: 30,
      tagScore: 25,
      roe: 10,
    },
    // その他: プライムと同じ
    other: {
      per: 22,
      pbr: 18,
      rsi: 10,
      priceRange: 10,
      epsGrowth: 18,
      tagScore: 15,
      roe: 7,
    },
  },
  ...COMMON_THRESHOLDS,
  roeThresholds: {
    low: 5, // 5%未満は0点
    medium: 8, // 8%で50点
    high: 15, // 15%以上で100点
  },
};
