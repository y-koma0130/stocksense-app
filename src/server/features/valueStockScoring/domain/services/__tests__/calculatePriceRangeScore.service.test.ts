import { describe, expect, it } from "vitest";
import type { MarketAdjustments, ScoringConfig } from "../../values/scoringConfig";
import { calculatePriceRangeScore } from "../calculatePriceRangeScore.service";

// テスト用のモック設定
const mockConfig: ScoringConfig = {
  perWeight: 30,
  pbrWeight: 25,
  rsiWeight: 20,
  priceRangeWeight: 15,
  perThresholds: {
    excellent: 70,
    good: 100,
  },
  pbrThresholds: {
    excellent: 70,
    good: 100,
  },
  rsiThresholds: {
    oversold: 30,
    neutral: 50,
  },
  priceRangeThresholds: {
    bottom: 20, // 20%以下で底値圏
    low: 40, // 40%以下で安値圏
  },
  marketAdjustments: {
    prime: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
    standard: { per: 1.05, pbr: 1.0, priceRange: 1.05 },
    growth: { per: 1.2, pbr: 0.8, priceRange: 0.95 },
    other: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
  },
};

const primeAdjustments: MarketAdjustments = { per: 1.0, pbr: 1.0, priceRange: 1.0 };
const standardAdjustments: MarketAdjustments = { per: 1.05, pbr: 1.0, priceRange: 1.05 };

describe("calculatePriceRangeScore", () => {
  describe("価格位置によるスコア計算", () => {
    it("安値（底値圏20%以下）で100点を返す", () => {
      // 価格=1200, 高値=2000, 安値=1000 → (1200-1000)/(2000-1000) = 20%
      const result = calculatePriceRangeScore(1200, 2000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(100);
    });

    it("期間安値と同等で100点を返す", () => {
      // 価格=1000, 高値=2000, 安値=1000 → 0%
      const result = calculatePriceRangeScore(1000, 2000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(100);
    });

    it("安値圏（40%位置）で50点を返す", () => {
      // 価格=1400, 高値=2000, 安値=1000 → 40%
      const result = calculatePriceRangeScore(1400, 2000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(50);
    });

    it("中間位置（30%）で75点を返す", () => {
      // 価格=1300, 高値=2000, 安値=1000 → 30%（20%と40%の中間）
      const result = calculatePriceRangeScore(1300, 2000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(75);
    });

    it("高値圏（100%）で0点を返す", () => {
      // 価格=2000, 高値=2000, 安値=1000 → 100%
      const result = calculatePriceRangeScore(2000, 2000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("中間位置（70%）で25点を返す", () => {
      // 価格=1700, 高値=2000, 安値=1000 → 70%（40%と100%の中間）
      const result = calculatePriceRangeScore(1700, 2000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(25);
    });
  });

  describe("nullおよび異常値ハンドリング", () => {
    it("現在価格がnullの場合、0点を返す", () => {
      const result = calculatePriceRangeScore(null, 2000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("高値がnullの場合、0点を返す", () => {
      const result = calculatePriceRangeScore(1500, null, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("安値がnullの場合、0点を返す", () => {
      const result = calculatePriceRangeScore(1500, 2000, null, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("高値と安値が同じ場合、0点を返す（ゼロ除算防止）", () => {
      const result = calculatePriceRangeScore(1000, 1000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("現在価格が安値を下回る場合、0点を返す", () => {
      const result = calculatePriceRangeScore(900, 2000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("現在価格が高値を上回る場合、0点を返す", () => {
      const result = calculatePriceRangeScore(2100, 2000, 1000, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });
  });

  describe("市場別補正テスト", () => {
    it("スタンダード市場で価格レンジ補正1.05が適用される", () => {
      // 価格=1400, 高値=2000, 安値=1000 → 40% → baseScore=50
      // standardAdjustments.priceRange = 1.05 → 50 * 1.05 = 52.5 → 53（四捨五入）
      const result = calculatePriceRangeScore(1400, 2000, 1000, mockConfig, standardAdjustments);
      expect(result).toBe(53);
    });

    it("補正後100を超える場合は100にクリップされる", () => {
      // 価格=1000, 高値=2000, 安値=1000 → 0% → baseScore=100
      // standardAdjustments.priceRange = 1.05 → 100 * 1.05 = 105 → クリップで100
      const result = calculatePriceRangeScore(1000, 2000, 1000, mockConfig, standardAdjustments);
      expect(result).toBe(100);
    });
  });
});
