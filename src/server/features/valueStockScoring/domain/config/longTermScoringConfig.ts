import { type LongTermWeights, longTermWeightsSchema } from "../values/longTerm/weights";

/**
 * 長期スコアリング設定
 */
export type LongTermScoringConfig = {
  weights: {
    prime: LongTermWeights;
    standard: LongTermWeights;
    growth: LongTermWeights;
    other: LongTermWeights;
  };
  perThresholds: {
    excellent: number;
    good: number;
  };
  pbrThresholds: {
    excellent: number;
    good: number;
  };
  pbrPenaltyThresholds: {
    severelyLow: number;
    low: number;
    lowRoeThreshold: number;
    severePenalty: number;
    lowPenalty: number;
  };
  rsiThresholds: {
    oversold: number;
    neutral: number;
  };
  priceRangeThresholds: {
    bottom: number;
    low: number;
  };
  epsGrowthThresholds: {
    lowGrowth: number;
    highGrowth: number;
  };
  roeThresholds: {
    low: number;
    medium: number;
    high: number;
  };
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
    prime: longTermWeightsSchema.parse({
      per: 22,
      pbr: 18,
      rsi: 10,
      priceRange: 10,
      epsGrowth: 18,
      tagScore: 15,
      roe: 7,
    }),
    standard: longTermWeightsSchema.parse({
      per: 25,
      pbr: 20,
      rsi: 10,
      priceRange: 10,
      epsGrowth: 15,
      tagScore: 13,
      roe: 7,
    }),
    growth: longTermWeightsSchema.parse({
      per: 8,
      pbr: 5,
      rsi: 10,
      priceRange: 12,
      epsGrowth: 30,
      tagScore: 25,
      roe: 10,
    }),
    other: longTermWeightsSchema.parse({
      per: 22,
      pbr: 18,
      rsi: 10,
      priceRange: 10,
      epsGrowth: 18,
      tagScore: 15,
      roe: 7,
    }),
  },
  perThresholds: {
    excellent: 70,
    good: 100,
  },
  pbrThresholds: {
    excellent: 70,
    good: 100,
  },
  pbrPenaltyThresholds: {
    severelyLow: 0.3,
    low: 0.5,
    lowRoeThreshold: 5,
    severePenalty: 0.7,
    lowPenalty: 0.8,
  },
  rsiThresholds: {
    oversold: 30,
    neutral: 50,
  },
  priceRangeThresholds: {
    bottom: 20,
    low: 40,
  },
  epsGrowthThresholds: {
    lowGrowth: 10,
    highGrowth: 20,
  },
  roeThresholds: {
    low: 5,
    medium: 8,
    high: 15,
  },
};
