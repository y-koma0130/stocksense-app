import { describe, expect, it } from "vitest";
import type { PriceRangeThresholds } from "../../config/thresholdTypes";
import { calculatePriceRangeScore } from "../calculatePriceRangeScore.service";

// テスト用の閾値設定
const mockThresholds: PriceRangeThresholds = {
  bottom: 20, // 20%以下で底値圏
  low: 40, // 40%以下で安値圏
};

describe("calculatePriceRangeScore", () => {
  describe("価格位置によるスコア計算", () => {
    it("安値（底値圏20%以下）で100点を返す", () => {
      // 価格=1200, 高値=2000, 安値=1000 → (1200-1000)/(2000-1000) = 20%
      const result = calculatePriceRangeScore(1200, 2000, 1000, mockThresholds);
      expect(result).toBe(100);
    });

    it("期間安値と同等で100点を返す", () => {
      // 価格=1000, 高値=2000, 安値=1000 → 0%
      const result = calculatePriceRangeScore(1000, 2000, 1000, mockThresholds);
      expect(result).toBe(100);
    });

    it("安値圏（40%位置）で50点を返す", () => {
      // 価格=1400, 高値=2000, 安値=1000 → 40%
      const result = calculatePriceRangeScore(1400, 2000, 1000, mockThresholds);
      expect(result).toBe(50);
    });

    it("中間位置（30%）で75点を返す", () => {
      // 価格=1300, 高値=2000, 安値=1000 → 30%（20%と40%の中間）
      const result = calculatePriceRangeScore(1300, 2000, 1000, mockThresholds);
      expect(result).toBe(75);
    });

    it("高値圏（100%）で0点を返す", () => {
      // 価格=2000, 高値=2000, 安値=1000 → 100%
      const result = calculatePriceRangeScore(2000, 2000, 1000, mockThresholds);
      expect(result).toBe(0);
    });

    it("中間位置（70%）で25点を返す", () => {
      // 価格=1700, 高値=2000, 安値=1000 → 70%（40%と100%の中間）
      const result = calculatePriceRangeScore(1700, 2000, 1000, mockThresholds);
      expect(result).toBe(25);
    });
  });

  describe("nullおよび異常値ハンドリング", () => {
    it("現在価格がnullの場合、0点を返す", () => {
      const result = calculatePriceRangeScore(null, 2000, 1000, mockThresholds);
      expect(result).toBe(0);
    });

    it("高値がnullの場合、0点を返す", () => {
      const result = calculatePriceRangeScore(1500, null, 1000, mockThresholds);
      expect(result).toBe(0);
    });

    it("安値がnullの場合、0点を返す", () => {
      const result = calculatePriceRangeScore(1500, 2000, null, mockThresholds);
      expect(result).toBe(0);
    });

    it("高値と安値が同じ場合、0点を返す（ゼロ除算防止）", () => {
      const result = calculatePriceRangeScore(1000, 1000, 1000, mockThresholds);
      expect(result).toBe(0);
    });

    it("現在価格が安値を下回る場合、0点を返す", () => {
      const result = calculatePriceRangeScore(900, 2000, 1000, mockThresholds);
      expect(result).toBe(0);
    });

    it("現在価格が高値を上回る場合、0点を返す", () => {
      const result = calculatePriceRangeScore(2100, 2000, 1000, mockThresholds);
      expect(result).toBe(0);
    });
  });
});
