import { describe, expect, it } from "vitest";
import type { MarketAdjustments, ScoringConfig } from "../../values/scoringConfig";
import { calculatePERScore } from "../calculatePERScore.service";

// テスト用のモック設定
const mockConfig: ScoringConfig = {
  perWeight: 30,
  pbrWeight: 25,
  rsiWeight: 20,
  priceRangeWeight: 15,
  perThresholds: {
    excellent: 70, // 70%以下で満点
    good: 100, // 100%以下で中程度
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
    bottom: 20,
    low: 40,
  },
  marketAdjustments: {
    prime: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
    standard: { per: 1.05, pbr: 1.0, priceRange: 1.05 },
    growth: { per: 1.2, pbr: 0.8, priceRange: 0.95 },
    other: { per: 1.0, pbr: 1.0, priceRange: 1.0 },
  },
};

const primeAdjustments: MarketAdjustments = { per: 1.0, pbr: 1.0, priceRange: 1.0 };
const growthAdjustments: MarketAdjustments = { per: 1.2, pbr: 0.8, priceRange: 0.95 };

describe("calculatePERScore", () => {
  describe("業種平均比によるスコア計算", () => {
    it("PERが業種平均の70%以下で100点を返す", () => {
      // PER=7, 業種平均PER=10 → 70%
      const result = calculatePERScore(7, 10, mockConfig, primeAdjustments);
      expect(result).toBe(100);
    });

    it("PERが業種平均の50%で100点を返す（優良ゾーン）", () => {
      // PER=5, 業種平均PER=10 → 50%
      const result = calculatePERScore(5, 10, mockConfig, primeAdjustments);
      expect(result).toBe(100);
    });

    it("PERが業種平均と同等（100%）で50点を返す", () => {
      // PER=10, 業種平均PER=10 → 100%
      const result = calculatePERScore(10, 10, mockConfig, primeAdjustments);
      expect(result).toBe(50);
    });

    it("PERが業種平均の85%で75点を返す（線形補間）", () => {
      // PER=8.5, 業種平均PER=10 → 85%（70%と100%の中間）
      const result = calculatePERScore(8.5, 10, mockConfig, primeAdjustments);
      expect(result).toBe(75);
    });

    it("PERが業種平均の150%以上で0点を返す", () => {
      // PER=15, 業種平均PER=10 → 150%
      const result = calculatePERScore(15, 10, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("PERが業種平均の125%で25点を返す（線形補間）", () => {
      // PER=12.5, 業種平均PER=10 → 125%（100%と150%の中間）
      const result = calculatePERScore(12.5, 10, mockConfig, primeAdjustments);
      expect(result).toBe(25);
    });
  });

  describe("nullおよび異常値ハンドリング", () => {
    it("PERがnullの場合、0点を返す", () => {
      const result = calculatePERScore(null, 10, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("業種平均PERがnullの場合、0点を返す", () => {
      const result = calculatePERScore(10, null, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("PERが0以下の場合、0点を返す", () => {
      const result = calculatePERScore(0, 10, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("PERが負の場合、0点を返す", () => {
      const result = calculatePERScore(-5, 10, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });

    it("業種平均PERが0以下の場合、0点を返す", () => {
      const result = calculatePERScore(10, 0, mockConfig, primeAdjustments);
      expect(result).toBe(0);
    });
  });

  describe("市場別補正テスト", () => {
    it("グロース市場でPER補正1.2が適用される", () => {
      // PER=10, 業種平均PER=10 → 100% → baseScore=50
      // growthAdjustments.per = 1.2 → 50 * 1.2 = 60
      const result = calculatePERScore(10, 10, mockConfig, growthAdjustments);
      expect(result).toBe(60);
    });

    it("補正後100を超える場合は100にクリップされる", () => {
      // PER=5, 業種平均PER=10 → 50% → baseScore=100
      // growthAdjustments.per = 1.2 → 100 * 1.2 = 120 → クリップで100
      const result = calculatePERScore(5, 10, mockConfig, growthAdjustments);
      expect(result).toBe(100);
    });
  });
});
