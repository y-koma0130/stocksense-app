import { type MidTermWeights, midTermWeightsSchema } from "../values/midTerm/weights";

/**
 * 中期スコアリング設定
 */
export type MidTermScoringConfig = {
  weights: {
    prime: MidTermWeights;
    standard: MidTermWeights;
    growth: MidTermWeights;
    other: MidTermWeights;
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
    prime: midTermWeightsSchema.parse({
      per: 24,
      pbr: 18,
      rsi: 16,
      priceRange: 12,
      rsiMomentum: 18,
      volumeSurge: 12,
      epsGrowth: 0,
      tagScore: 0,
    }),
    standard: midTermWeightsSchema.parse({
      per: 26,
      pbr: 20,
      rsi: 16,
      priceRange: 12,
      rsiMomentum: 16,
      volumeSurge: 10,
      epsGrowth: 0,
      tagScore: 0,
    }),
    growth: midTermWeightsSchema.parse({
      per: 15,
      pbr: 5,
      rsi: 18,
      priceRange: 15,
      rsiMomentum: 17,
      volumeSurge: 10,
      epsGrowth: 12,
      tagScore: 8,
    }),
    other: midTermWeightsSchema.parse({
      per: 24,
      pbr: 18,
      rsi: 16,
      priceRange: 12,
      rsiMomentum: 18,
      volumeSurge: 12,
      epsGrowth: 0,
      tagScore: 0,
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
};
