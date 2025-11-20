import { z } from "zod";

/**
 * スコアリング設定のZodスキーマ
 */
export const scoringConfigSchema = z.object({
  perWeight: z.number(),
  perThresholds: z.object({
    veryLow: z.number(),
    low: z.number(),
  }),
  pbrWeight: z.number(),
  pbrThresholds: z.object({
    veryLow: z.number(),
    low: z.number(),
  }),
  rsiWeight: z.number(),
  rsiThresholds: z.object({
    oversold: z.number(),
    moderate: z.number(),
  }),
  priceRangeWeight: z.number(),
  priceRangeThresholds: z.object({
    veryLow: z.number(),
    low: z.number(),
  }),
  sectorWeight: z.number(),
  sectorThresholds: z.object({
    muchLower: z.number(),
    lower: z.number(),
  }),
});

export type ScoringConfig = z.infer<typeof scoringConfigSchema>;

/**
 * 中期（週次）スコアリングの設定
 */
export const MID_TERM_CONFIG: ScoringConfig = {
  perWeight: 25,
  pbrWeight: 20,
  rsiWeight: 30,
  priceRangeWeight: 15,
  sectorWeight: 10,
  perThresholds: {
    veryLow: 10,
    low: 15,
  },
  pbrThresholds: {
    veryLow: 0.8,
    low: 1.0,
  },
  rsiThresholds: {
    oversold: 30,
    moderate: 40,
  },
  priceRangeThresholds: {
    veryLow: 0.3,
    low: 0.4,
  },
  sectorThresholds: {
    muchLower: 0.7,
    lower: 0.85,
  },
};

/**
 * 長期（月次）スコアリングの設定
 */
export const LONG_TERM_CONFIG: ScoringConfig = {
  perWeight: 30,
  pbrWeight: 25,
  rsiWeight: 15,
  priceRangeWeight: 15,
  sectorWeight: 15,
  perThresholds: {
    veryLow: 10,
    low: 15,
  },
  pbrThresholds: {
    veryLow: 0.8,
    low: 1.0,
  },
  rsiThresholds: {
    oversold: 30,
    moderate: 40,
  },
  priceRangeThresholds: {
    veryLow: 0.3,
    low: 0.4,
  },
  sectorThresholds: {
    muchLower: 0.7,
    lower: 0.85,
  },
};

/**
 * スコアの最小閾値（この値以上のスコアのみDBに保存）
 */
export const SCORE_THRESHOLD = 0.6;
