import { z } from "zod";

/**
 * 市場別の補正係数スキーマ
 */
export const marketAdjustmentsSchema = z.object({
  per: z.number().min(0.5).max(1.5), // ±50%以内に制限
  pbr: z.number().min(0.5).max(1.5),
  priceRange: z.number().min(0.5).max(1.5),
});

export type MarketAdjustments = z.infer<typeof marketAdjustmentsSchema>;

/**
 * PER/PBRの閾値（業種平均比のパーセント値）
 */
export const ratioThresholdsSchema = z.object({
  excellent: z.number(), // 優良（最高スコア）の閾値
  good: z.number(), // 良好の閾値
});

export type RatioThresholds = z.infer<typeof ratioThresholdsSchema>;

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
 * スコアリング設定のZodスキーマ
 */
export const scoringConfigSchema = z.object({
  // 重み（合計100%）
  perWeight: z.number().min(0).max(100),
  pbrWeight: z.number().min(0).max(100),
  rsiWeight: z.number().min(0).max(100),
  priceRangeWeight: z.number().min(0).max(100),
  rsiMomentumWeight: z.number().min(0).max(100).optional(), // 中期のみ使用
  epsGrowthWeight: z.number().min(0).max(100).optional(), // 長期のみ使用

  // 各指標の閾値
  perThresholds: ratioThresholdsSchema,
  pbrThresholds: ratioThresholdsSchema,
  rsiThresholds: rsiThresholdsSchema,
  priceRangeThresholds: priceRangeThresholdsSchema,

  // 市場別補正係数
  marketAdjustments: z.object({
    prime: marketAdjustmentsSchema,
    standard: marketAdjustmentsSchema,
    growth: marketAdjustmentsSchema,
    other: marketAdjustmentsSchema,
  }),
});

export type ScoringConfig = z.infer<typeof scoringConfigSchema>;

/**
 * 中期（週次）スコアリングの設定
 * 重み合計: 100%
 * PER: 26%, PBR: 20%, RSI静的: 18%, 価格レンジ: 14%, RSIモメンタム: 22%
 */
export const MID_TERM_CONFIG: ScoringConfig = {
  // 重み配分（合計100%）
  perWeight: 26, // 26%
  pbrWeight: 20, // 20%
  rsiWeight: 18, // 18%（静的RSI）
  priceRangeWeight: 14, // 14%
  rsiMomentumWeight: 22, // 22%（RSIモメンタム - 反発初動検出）

  // PER閾値（業種平均比のパーセント値）
  perThresholds: {
    excellent: 70, // 70%以下で満点
    good: 100, // 100%以下で中程度
  },

  // PBR閾値（業種平均比のパーセント値）
  pbrThresholds: {
    excellent: 70, // 70%以下で満点
    good: 100, // 100%以下で中程度
  },

  // RSI閾値
  rsiThresholds: {
    oversold: 30, // 30以下で売られすぎ
    neutral: 50, // 50以下で中立
  },

  // 価格レンジ閾値（パーセント値）
  priceRangeThresholds: {
    bottom: 20, // 20%以下で底値圏
    low: 40, // 40%以下で安値圏
  },

  // 市場別補正係数（小幅調整）
  marketAdjustments: {
    prime: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
    standard: { per: 1.05, pbr: 1.0, priceRange: 1.05 },
    growth: { per: 1.2, pbr: 0.8, priceRange: 0.95 }, // グロースはPER重視、PBR軽視
    other: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
  },
};

/**
 * 長期（月次）スコアリングの設定
 * 重み合計: 100%
 * PER: 28%, PBR: 25%, RSI: 15%, 価格レンジ: 12%, EPS成長率: 20%
 */
export const LONG_TERM_CONFIG: ScoringConfig = {
  // 重み配分（合計100%）
  perWeight: 28, // 28%
  pbrWeight: 25, // 25%
  rsiWeight: 15, // 15%
  priceRangeWeight: 12, // 12%
  epsGrowthWeight: 20, // 20%（3年EPS成長率 - 長期成長性評価）

  // PER閾値（業種平均比のパーセント値）
  perThresholds: {
    excellent: 70, // 70%以下で満点
    good: 100, // 100%以下で中程度
  },

  // PBR閾値（業種平均比のパーセント値）
  pbrThresholds: {
    excellent: 70, // 70%以下で満点
    good: 100, // 100%以下で中程度
  },

  // RSI閾値
  rsiThresholds: {
    oversold: 30, // 30以下で売られすぎ
    neutral: 50, // 50以下で中立
  },

  // 価格レンジ閾値（パーセント値）
  priceRangeThresholds: {
    bottom: 20, // 20%以下で底値圏
    low: 40, // 40%以下で安値圏
  },

  // 市場別補正係数（小幅調整）
  marketAdjustments: {
    prime: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
    standard: { per: 1.05, pbr: 1.0, priceRange: 1.05 },
    growth: { per: 1.2, pbr: 0.8, priceRange: 0.95 }, // グロースはPER重視、PBR軽視
    other: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
  },
};
