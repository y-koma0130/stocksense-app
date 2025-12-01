import { describe, expect, it } from "vitest";
import { calculateEpsGrowthRate } from "../calculateEpsGrowthRate.service";
import { calculateEpsGrowthScore } from "../calculateEpsGrowthScore.service";

describe("calculateEpsGrowthRate", () => {
  describe("正常なCAGR計算", () => {
    it("3年間で2倍成長した場合、約26%の成長率を返す", () => {
      // 100 -> 200 (3年で2倍) = CAGR約26%
      const result = calculateEpsGrowthRate(200, 100);
      expect(result).toBeCloseTo(26, 0); // 26%前後
    });

    it("3年間変化なしの場合、0%を返す", () => {
      const result = calculateEpsGrowthRate(100, 100);
      expect(result).toBe(0);
    });

    it("3年間で1.331倍成長した場合、約10%の成長率を返す", () => {
      // 1.1^3 = 1.331
      const result = calculateEpsGrowthRate(133.1, 100);
      expect(result).toBeCloseTo(10, 0);
    });

    it("3年間で1.728倍成長した場合、約20%の成長率を返す", () => {
      // 1.2^3 = 1.728
      const result = calculateEpsGrowthRate(172.8, 100);
      expect(result).toBeCloseTo(20, 0);
    });
  });

  describe("計算不可ケース", () => {
    it("epsLatestがnullの場合、nullを返す", () => {
      const result = calculateEpsGrowthRate(null, 100);
      expect(result).toBeNull();
    });

    it("eps3yAgoがnullの場合、nullを返す", () => {
      const result = calculateEpsGrowthRate(100, null);
      expect(result).toBeNull();
    });

    it("両方nullの場合、nullを返す", () => {
      const result = calculateEpsGrowthRate(null, null);
      expect(result).toBeNull();
    });

    it("eps3yAgoが0の場合、nullを返す（ゼロ除算防止）", () => {
      const result = calculateEpsGrowthRate(100, 0);
      expect(result).toBeNull();
    });

    it("eps3yAgoが負の場合、nullを返す（負のEPSからの成長率は無意味）", () => {
      const result = calculateEpsGrowthRate(100, -50);
      expect(result).toBeNull();
    });

    it("epsLatestが負の場合、nullを返す（赤字転落）", () => {
      const result = calculateEpsGrowthRate(-50, 100);
      expect(result).toBeNull();
    });
  });
});

describe("calculateEpsGrowthScore", () => {
  describe("スコア境界値テスト", () => {
    it("成長率20%以上で100点を返す", () => {
      // 明確に20%を超える値を使用（1.25^3 = 1.953125）
      const result = calculateEpsGrowthScore(200, 100);
      expect(result).toBe(100);
    });

    it("成長率30%で100点を返す（上限クリップ）", () => {
      // 1.3^3 = 2.197 → 30%成長
      const result = calculateEpsGrowthScore(219.7, 100);
      expect(result).toBe(100);
    });

    it("成長率10%で50点を返す（中間点）", () => {
      // 1.1^3 = 1.331 → 10%成長
      const result = calculateEpsGrowthScore(133.1, 100);
      expect(result).toBeCloseTo(50, 0);
    });

    it("成長率0%で0点を返す", () => {
      const result = calculateEpsGrowthScore(100, 100);
      expect(result).toBe(0);
    });

    it("マイナス成長で0点を返す", () => {
      // 減収 80 < 100
      const result = calculateEpsGrowthScore(80, 100);
      expect(result).toBe(0);
    });
  });

  describe("線形補間テスト", () => {
    it("成長率5%で25点を返す（0-10%ゾーンの中間）", () => {
      // 1.05^3 = 1.157625 → 約5%成長
      const result = calculateEpsGrowthScore(115.7625, 100);
      expect(result).toBeCloseTo(25, 0);
    });

    it("成長率15%で75点を返す（10-20%ゾーンの中間）", () => {
      // 1.15^3 = 1.520875 → 約15%成長
      const result = calculateEpsGrowthScore(152.0875, 100);
      expect(result).toBeCloseTo(75, 0);
    });
  });

  describe("nullハンドリング", () => {
    it("epsLatestがnullの場合、中央値50を返す", () => {
      const result = calculateEpsGrowthScore(null, 100);
      expect(result).toBe(50);
    });

    it("eps3yAgoがnullの場合、中央値50を返す", () => {
      const result = calculateEpsGrowthScore(100, null);
      expect(result).toBe(50);
    });

    it("eps3yAgoが0の場合、中央値50を返す", () => {
      const result = calculateEpsGrowthScore(100, 0);
      expect(result).toBe(50);
    });

    it("eps3yAgoが負の場合、中央値50を返す", () => {
      const result = calculateEpsGrowthScore(100, -50);
      expect(result).toBe(50);
    });
  });

  describe("実際の銘柄データに近いケース", () => {
    it("EPS 150円 → 200円 の3年成長（約10%CAGR）", () => {
      const result = calculateEpsGrowthScore(200, 150);
      // (200/150)^(1/3) - 1 = 約10%
      expect(result).toBeGreaterThanOrEqual(45);
      expect(result).toBeLessThanOrEqual(55);
    });

    it("EPS 50円 → 100円 の3年成長（約26%CAGR）", () => {
      const result = calculateEpsGrowthScore(100, 50);
      // 20%以上なので100点
      expect(result).toBe(100);
    });
  });
});
