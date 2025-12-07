/**
 * PER/PBRの閾値（業種平均比のパーセント値）
 */
export type RatioThresholds = {
  excellent: number;
  good: number;
};

/**
 * PBRの絶対値ペナルティ閾値
 */
export type PbrPenaltyThresholds = {
  severelyLow: number;
  low: number;
  lowRoeThreshold: number;
  severePenalty: number;
  lowPenalty: number;
};

/**
 * RSIの閾値
 */
export type RsiThresholds = {
  oversold: number;
  neutral: number;
};

/**
 * 価格レンジの閾値（パーセント値）
 */
export type PriceRangeThresholds = {
  bottom: number;
  low: number;
};

/**
 * EPS成長率の閾値
 */
export type EpsGrowthThresholds = {
  lowGrowth: number;
  highGrowth: number;
};

/**
 * ROEの閾値
 */
export type RoeThresholds = {
  low: number;
  medium: number;
  high: number;
};
