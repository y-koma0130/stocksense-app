import { describe, expect, it } from "vitest";
import type { RatioThresholds } from "../../values/scoringConfig";
import { calculatePERScore } from "../calculatePERScore.service";

// テスト用の閾値設定
const mockThresholds: RatioThresholds = {
  excellent: 70, // 70%以下で満点
  good: 100, // 100%以下で中程度
};

describe("calculatePERScore", () => {
  describe("業種平均比によるスコア計算", () => {
    it("PERが業種平均の70%以下で100点を返す", () => {
      // PER=7, 業種平均PER=10 → 70%
      const result = calculatePERScore(7, 10, mockThresholds);
      expect(result).toBe(100);
    });

    it("PERが業種平均の50%で100点を返す（優良ゾーン）", () => {
      // PER=5, 業種平均PER=10 → 50%
      const result = calculatePERScore(5, 10, mockThresholds);
      expect(result).toBe(100);
    });

    it("PERが業種平均と同等（100%）で50点を返す", () => {
      // PER=10, 業種平均PER=10 → 100%
      const result = calculatePERScore(10, 10, mockThresholds);
      expect(result).toBe(50);
    });

    it("PERが業種平均の85%で75点を返す（線形補間）", () => {
      // PER=8.5, 業種平均PER=10 → 85%（70%と100%の中間）
      const result = calculatePERScore(8.5, 10, mockThresholds);
      expect(result).toBe(75);
    });

    it("PERが業種平均の150%以上で0点を返す", () => {
      // PER=15, 業種平均PER=10 → 150%
      const result = calculatePERScore(15, 10, mockThresholds);
      expect(result).toBe(0);
    });

    it("PERが業種平均の125%で25点を返す（線形補間）", () => {
      // PER=12.5, 業種平均PER=10 → 125%（100%と150%の中間）
      const result = calculatePERScore(12.5, 10, mockThresholds);
      expect(result).toBe(25);
    });
  });

  describe("nullおよび異常値ハンドリング", () => {
    it("PERがnullの場合、0点を返す", () => {
      const result = calculatePERScore(null, 10, mockThresholds);
      expect(result).toBe(0);
    });

    it("業種平均PERがnullの場合、0点を返す", () => {
      const result = calculatePERScore(10, null, mockThresholds);
      expect(result).toBe(0);
    });

    it("PERが0以下の場合、0点を返す", () => {
      const result = calculatePERScore(0, 10, mockThresholds);
      expect(result).toBe(0);
    });

    it("PERが負の場合、0点を返す", () => {
      const result = calculatePERScore(-5, 10, mockThresholds);
      expect(result).toBe(0);
    });

    it("業種平均PERが0以下の場合、0点を返す", () => {
      const result = calculatePERScore(10, 0, mockThresholds);
      expect(result).toBe(0);
    });
  });
});
