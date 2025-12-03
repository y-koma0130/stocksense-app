import { describe, expect, it } from "vitest";
import { calculateTagScore, type TagScoreInput } from "../calculateTagScore.service";

// テスト用の基本入力を作成
const createTagScoreInput = (overrides: Partial<TagScoreInput> = {}): TagScoreInput => ({
  stockMacroTagIds: [],
  stockThemeTagIds: [],
  favorableMacroTagIds: [],
  favorableThemeTagIds: [],
  unfavorableMacroTagIds: [],
  unfavorableThemeTagIds: [],
  ...overrides,
});

describe("calculateTagScore", () => {
  describe("基本スコアリング", () => {
    it("タグの一致がない場合、ベーススコア50を返す", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai"],
        favorableThemeTagIds: ["ev"], // 一致なし
        unfavorableThemeTagIds: ["crypto"], // 一致なし
      });

      const result = calculateTagScore(input, false);

      expect(result).toBe(50);
    });

    it("favorableタグが1つ一致する場合、65点を返す", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai"],
        favorableThemeTagIds: ["ai"],
      });

      const result = calculateTagScore(input, true); // テーマのみ

      expect(result).toBe(65); // 50 + 15
    });

    it("favorableタグが2つ一致する場合、80点を返す", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai", "ev"],
        favorableThemeTagIds: ["ai", "ev"],
      });

      const result = calculateTagScore(input, true);

      expect(result).toBe(80); // 50 + 30
    });

    it("favorableタグが3つ以上一致する場合、100点を返す", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai", "ev", "automation"],
        favorableThemeTagIds: ["ai", "ev", "automation"],
      });

      const result = calculateTagScore(input, true);

      expect(result).toBe(100); // 50 + 50
    });

    it("unfavorableタグが1つ一致する場合、35点を返す", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["crypto"],
        unfavorableThemeTagIds: ["crypto"],
      });

      const result = calculateTagScore(input, true);

      expect(result).toBe(35); // 50 - 15
    });

    it("unfavorableタグが2つ一致する場合、20点を返す", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["crypto", "real_estate"],
        unfavorableThemeTagIds: ["crypto", "real_estate"],
      });

      const result = calculateTagScore(input, true);

      expect(result).toBe(20); // 50 - 30
    });

    it("unfavorableタグが3つ以上一致する場合、0点を返す", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["crypto", "real_estate", "fossil_fuel"],
        unfavorableThemeTagIds: ["crypto", "real_estate", "fossil_fuel"],
      });

      const result = calculateTagScore(input, true);

      expect(result).toBe(0); // 50 - 50
    });
  });

  describe("相殺ロジック", () => {
    it("favorable 2, unfavorable 1 = net +1 → 65点", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai", "ev", "crypto"],
        favorableThemeTagIds: ["ai", "ev"],
        unfavorableThemeTagIds: ["crypto"],
      });

      const result = calculateTagScore(input, true);

      // favorable: 2マッチ = +30, unfavorable: 1マッチ = -15
      // net = 30 - 15 = +15 → score = 50 + 15 = 65
      expect(result).toBe(65);
    });

    it("favorable 1, unfavorable 1 = net 0 → 50点", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai", "crypto"],
        favorableThemeTagIds: ["ai"],
        unfavorableThemeTagIds: ["crypto"],
      });

      const result = calculateTagScore(input, true);

      // favorable: 1マッチ = +15, unfavorable: 1マッチ = -15
      // net = 15 - 15 = 0 → score = 50
      expect(result).toBe(50);
    });

    it("favorable 1, unfavorable 2 = net -1 → 35点", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai", "crypto", "real_estate"],
        favorableThemeTagIds: ["ai"],
        unfavorableThemeTagIds: ["crypto", "real_estate"],
      });

      const result = calculateTagScore(input, true);

      // favorable: 1マッチ = +15, unfavorable: 2マッチ = -30
      // net = 15 - 30 = -15 → score = 50 - 15 = 35
      expect(result).toBe(35);
    });

    it("favorable 3, unfavorable 2 = 高スコア", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai", "ev", "automation", "crypto", "real_estate"],
        favorableThemeTagIds: ["ai", "ev", "automation"],
        unfavorableThemeTagIds: ["crypto", "real_estate"],
      });

      const result = calculateTagScore(input, true);

      // favorable: 3マッチ = +50, unfavorable: 2マッチ = -30
      // net = 50 - 30 = +20 → score = 50 + 20 = 70
      expect(result).toBe(70);
    });
  });

  describe("長期スコア（テーマ+マクロの加重平均）", () => {
    it("テーマとマクロの両方が一致する場合、加重平均を返す", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai"],
        stockMacroTagIds: ["low_interest"],
        favorableThemeTagIds: ["ai"],
        favorableMacroTagIds: ["low_interest"],
      });

      const result = calculateTagScore(input, false); // useOnlyTheme = false

      // テーマ: 50 + 15 = 65
      // マクロ: 50 + 15 = 65
      // 加重平均: 65 * 0.6 + 65 * 0.4 = 65
      expect(result).toBe(65);
    });

    it("テーマのみ一致する場合、テーマの重み60%が反映される", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai", "ev"],
        stockMacroTagIds: [],
        favorableThemeTagIds: ["ai", "ev"],
        favorableMacroTagIds: ["low_interest"],
      });

      const result = calculateTagScore(input, false);

      // テーマ: 50 + 30 = 80
      // マクロ: 50 (一致なし)
      // 加重平均: 80 * 0.6 + 50 * 0.4 = 48 + 20 = 68
      expect(result).toBe(68);
    });

    it("マクロのみ一致する場合、マクロの重み40%が反映される", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: [],
        stockMacroTagIds: ["low_interest", "yen_weak"],
        favorableThemeTagIds: ["ai"],
        favorableMacroTagIds: ["low_interest", "yen_weak"],
      });

      const result = calculateTagScore(input, false);

      // テーマ: 50 (一致なし)
      // マクロ: 50 + 30 = 80
      // 加重平均: 50 * 0.6 + 80 * 0.4 = 30 + 32 = 62
      expect(result).toBe(62);
    });

    it("テーマとマクロで異なるスコアの場合、正しく加重平均される", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai", "ev", "automation"], // 3マッチ = +50
        stockMacroTagIds: ["high_interest"], // unfavorable 1マッチ = -15
        favorableThemeTagIds: ["ai", "ev", "automation"],
        favorableMacroTagIds: ["low_interest"],
        unfavorableMacroTagIds: ["high_interest"],
      });

      const result = calculateTagScore(input, false);

      // テーマ: 50 + 50 = 100
      // マクロ: 50 - 15 = 35
      // 加重平均: 100 * 0.6 + 35 * 0.4 = 60 + 14 = 74
      expect(result).toBe(74);
    });
  });

  describe("中期スコア（テーマのみ）", () => {
    it("useOnlyTheme=trueの場合、マクロタグは無視される", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["ai"],
        stockMacroTagIds: ["low_interest", "yen_weak", "inflation"], // 3マッチになるはず
        favorableThemeTagIds: ["ai"],
        favorableMacroTagIds: ["low_interest", "yen_weak", "inflation"],
      });

      const result = calculateTagScore(input, true); // useOnlyTheme = true

      // テーマのみ: 50 + 15 = 65
      // マクロは無視される
      expect(result).toBe(65);
    });
  });

  describe("境界値テスト", () => {
    it("スコアの下限は0", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["a", "b", "c", "d", "e"],
        unfavorableThemeTagIds: ["a", "b", "c", "d", "e"], // 5マッチ = -50
      });

      const result = calculateTagScore(input, true);

      // 50 - 50 = 0 (下限)
      expect(result).toBe(0);
    });

    it("スコアの上限は100", () => {
      const input = createTagScoreInput({
        stockThemeTagIds: ["a", "b", "c", "d", "e"],
        favorableThemeTagIds: ["a", "b", "c", "d", "e"], // 5マッチ = +50
      });

      const result = calculateTagScore(input, true);

      // 50 + 50 = 100 (上限)
      expect(result).toBe(100);
    });

    it("空の配列の場合、ベーススコア50を返す", () => {
      const input = createTagScoreInput();

      const result = calculateTagScore(input, false);

      expect(result).toBe(50);
    });
  });
});
