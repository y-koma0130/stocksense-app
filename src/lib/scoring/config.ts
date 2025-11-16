import type { ScoringConfig } from "./types";

/**
 * 中期（週次）スコアリングの設定
 */
export const MID_TERM_CONFIG: ScoringConfig = {
  // 重み: 合計100
  perWeight: 25,
  pbrWeight: 20,
  rsiWeight: 30, // 中期では割安感よりテクニカルを重視
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
  // 重み: 合計100
  perWeight: 30, // 長期では割安感を重視
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
