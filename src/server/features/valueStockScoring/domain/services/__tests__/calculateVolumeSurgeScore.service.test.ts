import { describe, expect, it } from "vitest";
import { VOLUME_SURGE_CONFIG } from "../../values/volumeConfig";
import { calculateVolumeSurgeScore } from "../calculateVolumeSurgeScore.service";

describe("calculateVolumeSurgeScore", () => {
  describe("線形補間のスコアリング", () => {
    it("出来高比率が2.0以上の場合、100点になる", () => {
      const score = calculateVolumeSurgeScore(20000, 10000); // ratio = 2.0
      expect(score).toBe(100);

      const scoreHigher = calculateVolumeSurgeScore(30000, 10000); // ratio = 3.0
      expect(scoreHigher).toBe(100);
    });

    it("出来高比率が1.0（横ばい）の場合、50点になる", () => {
      const score = calculateVolumeSurgeScore(10000, 10000); // ratio = 1.0
      expect(score).toBe(50);
    });

    it("出来高比率が0.5以下の場合、0点になる", () => {
      const score = calculateVolumeSurgeScore(5000, 10000); // ratio = 0.5
      expect(score).toBe(0);

      const scoreLower = calculateVolumeSurgeScore(3000, 10000); // ratio = 0.3
      expect(scoreLower).toBe(0);
    });

    it("出来高比率1.0〜2.0の間は50〜100に線形補間される", () => {
      // ratio = 1.5 → 75点（中間値）
      const score = calculateVolumeSurgeScore(15000, 10000);
      expect(score).toBe(75);

      // ratio = 1.25 → 62.5 → 63点（四捨五入）
      const scoreQuarter = calculateVolumeSurgeScore(12500, 10000);
      expect(scoreQuarter).toBe(63);

      // ratio = 1.75 → 87.5 → 88点（四捨五入）
      const scoreThreeQuarter = calculateVolumeSurgeScore(17500, 10000);
      expect(scoreThreeQuarter).toBe(88);
    });

    it("出来高比率0.5〜1.0の間は0〜50に線形補間される", () => {
      // ratio = 0.75 → 25点（中間値）
      const score = calculateVolumeSurgeScore(7500, 10000);
      expect(score).toBe(25);

      // ratio = 0.625 → 12.5 → 13点（四捨五入）
      const scoreLow = calculateVolumeSurgeScore(6250, 10000);
      expect(scoreLow).toBe(13);

      // ratio = 0.875 → 37.5 → 38点（四捨五入）
      const scoreHigh = calculateVolumeSurgeScore(8750, 10000);
      expect(scoreHigh).toBe(38);
    });
  });

  describe("nullハンドリング", () => {
    it("avgVolumeShortがnullの場合、ニュートラルスコア(50)を返す", () => {
      const score = calculateVolumeSurgeScore(null, 10000);
      expect(score).toBe(VOLUME_SURGE_CONFIG.NEUTRAL_SCORE);
    });

    it("avgVolumeLongがnullの場合、ニュートラルスコア(50)を返す", () => {
      const score = calculateVolumeSurgeScore(10000, null);
      expect(score).toBe(VOLUME_SURGE_CONFIG.NEUTRAL_SCORE);
    });

    it("両方nullの場合、ニュートラルスコア(50)を返す", () => {
      const score = calculateVolumeSurgeScore(null, null);
      expect(score).toBe(VOLUME_SURGE_CONFIG.NEUTRAL_SCORE);
    });

    it("avgVolumeLongが0の場合、ニュートラルスコア(50)を返す", () => {
      const score = calculateVolumeSurgeScore(10000, 0);
      expect(score).toBe(VOLUME_SURGE_CONFIG.NEUTRAL_SCORE);
    });
  });

  describe("スコアの範囲検証", () => {
    it("スコアは常に0-100の範囲に収まる", () => {
      const testCases = [
        { short: 100000, long: 10000 }, // ratio = 10.0
        { short: 1000, long: 100000 }, // ratio = 0.01
        { short: 10000, long: 10000 }, // ratio = 1.0
        { short: 15000, long: 10000 }, // ratio = 1.5
        { short: 7500, long: 10000 }, // ratio = 0.75
      ];

      for (const { short, long } of testCases) {
        const score = calculateVolumeSurgeScore(short, long);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });

    it("スコアは整数になる（四捨五入）", () => {
      const score = calculateVolumeSurgeScore(12345, 10000);
      expect(Number.isInteger(score)).toBe(true);
    });
  });
});
