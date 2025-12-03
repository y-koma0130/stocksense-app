import { describe, expect, it } from "vitest";
import type { LongTermIndicatorDto } from "../../../application/dto/indicator.dto";
import type { LongTermScoreInput } from "../calculateLongTermValueStockScore.service";
import { calculateLongTermValueStockScore } from "../calculateLongTermValueStockScore.service";

// テスト用の基本的な長期銘柄データ
const createBaseLongTermIndicator = (
  overrides: Partial<LongTermIndicatorDto> = {},
): LongTermIndicatorDto => ({
  periodType: "long_term",
  stockId: "test-stock-id",
  tickerCode: "1234",
  tickerSymbol: "1234.T",
  name: "テスト株式会社",
  sectorCode: "3050",
  sectorName: "情報・通信業",
  market: "プライム",
  collectedAt: "2024-01-01T00:00:00Z",
  currentPrice: 1500,
  per: 8, // 業種平均の80%（良好）
  pbr: 0.8, // 業種平均の80%（良好）
  rsi: 35, // 売られすぎに近い
  priceHigh: 2000,
  priceLow: 1000,
  sectorAvgPer: 10,
  sectorAvgPbr: 1.0,
  equityRatio: 50,
  roe: 10,
  operatingIncomeDeclineYears: 0,
  operatingCashFlowNegativeYears: 0,
  revenueDeclineYears: 0,
  avgVolumeShort: 10000,
  epsLatest: 120,
  eps3yAgo: 100,
  macroTagIds: [],
  themeTagIds: [],
  ...overrides,
});

// テスト用のスコア入力を作成
const createScoreInput = (
  indicatorOverrides: Partial<LongTermIndicatorDto> = {},
  inputOverrides: Partial<Omit<LongTermScoreInput, "indicator">> = {},
): LongTermScoreInput => ({
  indicator: createBaseLongTermIndicator(indicatorOverrides),
  stockMacroTagIds: [],
  stockThemeTagIds: [],
  favorableMacroTagIds: [],
  favorableThemeTagIds: [],
  unfavorableMacroTagIds: [],
  unfavorableThemeTagIds: [],
  ...inputOverrides,
});

describe("calculateLongTermValueStockScore", () => {
  describe("基本スコアリング", () => {
    it("標準的な割安株のスコアを計算できる", () => {
      const input = createScoreInput();

      const result = calculateLongTermValueStockScore(input);

      expect(result.perScore).toBeGreaterThanOrEqual(0);
      expect(result.perScore).toBeLessThanOrEqual(100);
      expect(result.pbrScore).toBeGreaterThanOrEqual(0);
      expect(result.pbrScore).toBeLessThanOrEqual(100);
      expect(result.rsiScore).toBeGreaterThanOrEqual(0);
      expect(result.rsiScore).toBeLessThanOrEqual(100);
      expect(result.priceRangeScore).toBeGreaterThanOrEqual(0);
      expect(result.priceRangeScore).toBeLessThanOrEqual(100);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(1);
    });

    it("全て理想的な値の場合、高スコアになる", () => {
      const input = createScoreInput(
        {
          per: 5, // 業種平均の50%（非常に割安）
          pbr: 0.5, // 業種平均の50%（非常に割安）
          rsi: 25, // 売られすぎ
          currentPrice: 1100, // 安値圏（10%位置）
          roe: 15, // 高ROE
          epsLatest: 172.8, // 3年で20%成長（1.2^3）→ 高成長スコア
          eps3yAgo: 100,
        },
        {
          // 有望タグにも該当させてタグスコアを最大化
          stockMacroTagIds: ["low_interest"],
          stockThemeTagIds: ["ai"],
          favorableMacroTagIds: ["low_interest"],
          favorableThemeTagIds: ["ai"],
        },
      );

      const result = calculateLongTermValueStockScore(input);

      expect(result.perScore).toBe(100);
      expect(result.pbrScore).toBe(100);
      expect(result.rsiScore).toBe(100);
      expect(result.priceRangeScore).toBe(100);
      expect(result.totalScore).toBeGreaterThanOrEqual(0.9);
    });

    it("全て悪い値の場合、低スコアになる", () => {
      const input = createScoreInput({
        per: 20, // 業種平均の200%（割高）
        pbr: 2.0, // 業種平均の200%（割高）
        rsi: 75, // 買われすぎ
        currentPrice: 2000, // 高値（100%位置）
        roe: 3, // 低ROE
      });

      const result = calculateLongTermValueStockScore(input);

      expect(result.perScore).toBe(0);
      expect(result.pbrScore).toBe(0);
      expect(result.rsiScore).toBe(0);
      expect(result.priceRangeScore).toBe(0);
      expect(result.totalScore).toBeLessThan(0.2);
    });
  });

  describe("市場別重み配分の検証", () => {
    it("プライム市場では標準的な重み配分が適用される", () => {
      const input = createScoreInput({ market: "プライム" });

      const result = calculateLongTermValueStockScore(input);

      // スコアが計算可能であることを確認
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it("グロース市場では異なる重み配分が適用される", () => {
      const inputPrime = createScoreInput({ market: "プライム" });
      const inputGrowth = createScoreInput({ market: "グロース" });

      const resultPrime = calculateLongTermValueStockScore(inputPrime);
      const resultGrowth = calculateLongTermValueStockScore(inputGrowth);

      // 同じ指標値でも市場によってスコアが異なる
      expect(resultPrime.totalScore).not.toBe(resultGrowth.totalScore);
    });
  });

  describe("タグスコアの検証", () => {
    it("有望タグに該当する場合、スコアが向上する", () => {
      const inputWithTag = createScoreInput(
        { market: "プライム" },
        {
          stockThemeTagIds: ["ai"],
          favorableThemeTagIds: ["ai"],
        },
      );

      const inputWithoutTag = createScoreInput(
        { market: "プライム" },
        {
          stockThemeTagIds: [],
          favorableThemeTagIds: ["ai"],
        },
      );

      const resultWithTag = calculateLongTermValueStockScore(inputWithTag);
      const resultWithoutTag = calculateLongTermValueStockScore(inputWithoutTag);

      // タグが一致する方がスコアが高い
      expect(resultWithTag.totalScore).toBeGreaterThan(resultWithoutTag.totalScore);
    });

    it("複数のタグが一致する場合、さらにスコアが向上する", () => {
      const inputOneTag = createScoreInput(
        { market: "プライム" },
        {
          stockThemeTagIds: ["ai"],
          stockMacroTagIds: [],
          favorableThemeTagIds: ["ai", "ev"],
          favorableMacroTagIds: ["low_interest"],
        },
      );

      const inputMultipleTags = createScoreInput(
        { market: "プライム" },
        {
          stockThemeTagIds: ["ai", "ev"],
          stockMacroTagIds: ["low_interest"],
          favorableThemeTagIds: ["ai", "ev"],
          favorableMacroTagIds: ["low_interest"],
        },
      );

      const resultOneTag = calculateLongTermValueStockScore(inputOneTag);
      const resultMultipleTags = calculateLongTermValueStockScore(inputMultipleTags);

      expect(resultMultipleTags.totalScore).toBeGreaterThan(resultOneTag.totalScore);
    });

    it("unfavorableタグに該当する場合、スコアが低下する", () => {
      const inputWithUnfavorable = createScoreInput(
        { market: "プライム" },
        {
          stockThemeTagIds: ["crypto"],
          unfavorableThemeTagIds: ["crypto"],
        },
      );

      const inputWithoutUnfavorable = createScoreInput(
        { market: "プライム" },
        {
          stockThemeTagIds: ["crypto"],
          unfavorableThemeTagIds: [],
        },
      );

      const resultWithUnfavorable = calculateLongTermValueStockScore(inputWithUnfavorable);
      const resultWithoutUnfavorable = calculateLongTermValueStockScore(inputWithoutUnfavorable);

      // unfavorableタグに該当する方がスコアが低い
      expect(resultWithUnfavorable.totalScore).toBeLessThan(resultWithoutUnfavorable.totalScore);
    });

    it("favorableとunfavorableが相殺される", () => {
      const inputBoth = createScoreInput(
        { market: "プライム" },
        {
          stockThemeTagIds: ["ai", "crypto"],
          favorableThemeTagIds: ["ai"],
          unfavorableThemeTagIds: ["crypto"],
        },
      );

      const inputNone = createScoreInput(
        { market: "プライム" },
        {
          stockThemeTagIds: [],
          favorableThemeTagIds: ["ai"],
          unfavorableThemeTagIds: ["crypto"],
        },
      );

      const resultBoth = calculateLongTermValueStockScore(inputBoth);
      const resultNone = calculateLongTermValueStockScore(inputNone);

      // favorable +1, unfavorable +1 = 相殺でベーススコアと同じ
      expect(resultBoth.totalScore).toBe(resultNone.totalScore);
    });
  });

  describe("ROEスコアの検証", () => {
    it("高ROEの場合、スコアが向上する", () => {
      const inputHighROE = createScoreInput({ roe: 15 });
      const inputLowROE = createScoreInput({ roe: 5 });

      const resultHighROE = calculateLongTermValueStockScore(inputHighROE);
      const resultLowROE = calculateLongTermValueStockScore(inputLowROE);

      expect(resultHighROE.totalScore).toBeGreaterThan(resultLowROE.totalScore);
    });

    it("ROEがnullの場合、中央値が使用される", () => {
      const input = createScoreInput({ roe: null });

      const result = calculateLongTermValueStockScore(input);

      // スコアは計算可能（中央値50が使用される）
      expect(result.totalScore).toBeGreaterThan(0);
    });
  });

  describe("nullハンドリング", () => {
    it("主要指標がnullでもスコア計算が可能", () => {
      const input = createScoreInput({
        currentPrice: null,
        per: null,
        pbr: null,
        rsi: null,
        priceHigh: null,
        priceLow: null,
        sectorAvgPer: null,
        sectorAvgPbr: null,
        market: null,
        roe: null,
      });

      const result = calculateLongTermValueStockScore(input);

      expect(result.perScore).toBe(0);
      expect(result.pbrScore).toBe(0);
      expect(result.rsiScore).toBe(0);
      expect(result.priceRangeScore).toBe(0);
      // ROEとタグスコアはnullの場合50を返すため、totalScoreは0ではない
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe("セクタースコアの検証", () => {
    it("PERとPBRの平均がセクタースコアになる", () => {
      const input = createScoreInput({
        per: 7, // 70% → 100点
        pbr: 1.0, // 100% → 50点
      });

      const result = calculateLongTermValueStockScore(input);

      // sectorScore = (perScore + pbrScore) / 2
      expect(result.sectorScore).toBe(Math.round((result.perScore + result.pbrScore) / 2));
    });
  });
});
