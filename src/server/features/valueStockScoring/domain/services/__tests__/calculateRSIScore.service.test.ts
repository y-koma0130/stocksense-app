import { describe, expect, it } from "vitest";
import type { ScoringConfig } from "../../values/scoringConfig";
import { calculateRSIScore } from "../calculateRSIScore.service";

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
    oversold: 30, // 30以下で売られすぎ
    neutral: 50, // 50以下で中立
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

describe("calculateRSIScore", () => {
  describe("RSI値によるスコア計算", () => {
    it("RSI30以下で100点を返す（売られすぎ）", () => {
      const result = calculateRSIScore(30, mockConfig);
      expect(result).toBe(100);
    });

    it("RSI20で100点を返す（極端な売られすぎ）", () => {
      const result = calculateRSIScore(20, mockConfig);
      expect(result).toBe(100);
    });

    it("RSI50で50点を返す（中立）", () => {
      const result = calculateRSIScore(50, mockConfig);
      expect(result).toBe(50);
    });

    it("RSI40で75点を返す（売られすぎと中立の中間）", () => {
      // 30と50の中間 → 100と50の中間 = 75
      const result = calculateRSIScore(40, mockConfig);
      expect(result).toBe(75);
    });

    it("RSI70以上で0点を返す（買われすぎ）", () => {
      const result = calculateRSIScore(70, mockConfig);
      expect(result).toBe(0);
    });

    it("RSI80で0点を返す（極端な買われすぎ）", () => {
      const result = calculateRSIScore(80, mockConfig);
      expect(result).toBe(0);
    });

    it("RSI60で25点を返す（中立と買われすぎの中間）", () => {
      // 50と70の中間 → 50と0の中間 = 25
      const result = calculateRSIScore(60, mockConfig);
      expect(result).toBe(25);
    });
  });

  describe("nullハンドリング", () => {
    it("RSIがnullの場合、0点を返す", () => {
      const result = calculateRSIScore(null, mockConfig);
      expect(result).toBe(0);
    });
  });

  describe("バリュー投資観点でのテスト", () => {
    it("RSI25は買いシグナル（100点）", () => {
      const result = calculateRSIScore(25, mockConfig);
      expect(result).toBe(100);
    });

    it("RSI45は中程度の割安（75点前後）", () => {
      const result = calculateRSIScore(45, mockConfig);
      expect(result).toBeGreaterThanOrEqual(60);
      expect(result).toBeLessThanOrEqual(65);
    });

    it("RSI55は中立を少し超えた状態（40点前後）", () => {
      const result = calculateRSIScore(55, mockConfig);
      expect(result).toBeGreaterThanOrEqual(35);
      expect(result).toBeLessThanOrEqual(40);
    });
  });
});
