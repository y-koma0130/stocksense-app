import { describe, expect, it } from "vitest";
import { calculateRSIMomentumScore } from "../calculateRSIMomentumScore.service";

describe("calculateRSIMomentumScore", () => {
  describe("基本的なモメンタム計算", () => {
    it("モメンタム+30で100点を返す（強い上昇モメンタム）", () => {
      // rsiShort=60, rsi=30 → momentum=+30
      const result = calculateRSIMomentumScore(60, 30);
      expect(result).toBe(100);
    });

    it("モメンタム0で50点を返す（モメンタムなし）", () => {
      // rsiShort=40, rsi=40 → momentum=0
      const result = calculateRSIMomentumScore(40, 40);
      expect(result).toBe(50);
    });

    it("モメンタム-30で0点を返す（強い下降モメンタム）", () => {
      // rsiShort=30, rsi=60 → momentum=-30
      const result = calculateRSIMomentumScore(30, 60);
      expect(result).toBe(0);
    });
  });

  describe("境界値テスト", () => {
    it("モメンタム+15で75点を返す", () => {
      // rsiShort=55, rsi=40 → momentum=+15
      const result = calculateRSIMomentumScore(55, 40);
      expect(result).toBe(75);
    });

    it("モメンタム-15で25点を返す", () => {
      // rsiShort=25, rsi=40 → momentum=-15
      const result = calculateRSIMomentumScore(25, 40);
      expect(result).toBe(25);
    });
  });

  describe("クリッピングテスト", () => {
    it("モメンタム+40で100点にクリップされる", () => {
      // rsiShort=80, rsi=40 → momentum=+40
      const result = calculateRSIMomentumScore(80, 40);
      expect(result).toBe(100);
    });

    it("モメンタム-40で0点にクリップされる", () => {
      // rsiShort=20, rsi=60 → momentum=-40
      const result = calculateRSIMomentumScore(20, 60);
      expect(result).toBe(0);
    });
  });

  describe("nullハンドリング", () => {
    it("rsiShortがnullの場合、中央値50を返す", () => {
      const result = calculateRSIMomentumScore(null, 40);
      expect(result).toBe(50);
    });

    it("rsiがnullの場合、中央値50を返す", () => {
      const result = calculateRSIMomentumScore(40, null);
      expect(result).toBe(50);
    });

    it("両方nullの場合、中央値50を返す", () => {
      const result = calculateRSIMomentumScore(null, null);
      expect(result).toBe(50);
    });
  });

  describe("バリュー投資観点でのテスト", () => {
    it("売られすぎから反発初動（RSI20→35）で高スコア", () => {
      // 長期RSI=20（売られすぎ）、短期RSI=35（反発）→ momentum=+15
      const result = calculateRSIMomentumScore(35, 20);
      expect(result).toBe(75);
    });

    it("下落継続中（RSI40→30）で低スコア", () => {
      // 長期RSI=40、短期RSI=30（まだ下落中）→ momentum=-10
      const result = calculateRSIMomentumScore(30, 40);
      // -10 → ((-10 + 30) / 60) * 100 = 33.33
      expect(result).toBeCloseTo(33.33, 0);
    });
  });
});
