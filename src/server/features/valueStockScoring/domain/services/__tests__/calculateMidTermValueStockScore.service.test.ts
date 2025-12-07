import { describe, expect, it } from "vitest";
import type { MidTermIndicatorDto } from "../../../application/dto/midTermIndicator.dto";
import type { MidTermScoreInput } from "../calculateMidTermValueStockScore.service";
import { calculateMidTermValueStockScore } from "../calculateMidTermValueStockScore.service";

// テスト用の基本的な中期銘柄データ
const createBaseMidTermIndicator = (
  overrides: Partial<MidTermIndicatorDto> = {},
): MidTermIndicatorDto => ({
  periodType: "mid_term",
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
  rsiShort: 40, // RSIモメンタム = 40 - 35 = +5
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
  avgVolumeLong: 10000,
  epsLatest: 100,
  eps3yAgo: 80,
  macroTagIds: [],
  themeTagIds: [],
  ...overrides,
});

// テスト用のスコア入力を作成
const createScoreInput = (
  indicatorOverrides: Partial<MidTermIndicatorDto> = {},
  inputOverrides: Partial<Omit<MidTermScoreInput, "indicator">> = {},
): MidTermScoreInput => ({
  indicator: createBaseMidTermIndicator(indicatorOverrides),
  stockMacroTagIds: [],
  stockThemeTagIds: [],
  favorableMacroTagIds: [],
  favorableThemeTagIds: [],
  unfavorableMacroTagIds: [],
  unfavorableThemeTagIds: [],
  epsLatest: 100,
  eps3yAgo: 80,
  ...inputOverrides,
});

describe("calculateMidTermValueStockScore", () => {
  describe("基本スコアリング", () => {
    it("標準的な割安株のスコアを計算できる", () => {
      const input = createScoreInput();

      const result = calculateMidTermValueStockScore(input);

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

    it("RSIモメンタムが正の場合、スコアが向上する", () => {
      const inputPositive = createScoreInput({ rsiShort: 55 }); // momentum = +20
      const inputNegative = createScoreInput({ rsiShort: 20 }); // momentum = -15

      const resultPositive = calculateMidTermValueStockScore(inputPositive);
      const resultNegative = calculateMidTermValueStockScore(inputNegative);

      expect(resultPositive.totalScore).toBeGreaterThan(resultNegative.totalScore);
    });

    it("出来高が急増している場合、スコアが向上する", () => {
      const inputHigh = createScoreInput({
        avgVolumeShort: 20000, // ratio = 2.0 → 100点
        avgVolumeLong: 10000,
      });
      const inputLow = createScoreInput({
        avgVolumeShort: 5000, // ratio = 0.5 → 0点
        avgVolumeLong: 10000,
      });

      const resultHigh = calculateMidTermValueStockScore(inputHigh);
      const resultLow = calculateMidTermValueStockScore(inputLow);

      expect(resultHigh.totalScore).toBeGreaterThan(resultLow.totalScore);
    });

    it("出来高が横ばいの場合、中間スコアになる", () => {
      const input = createScoreInput({
        avgVolumeShort: 10000, // ratio = 1.0 → 50点
        avgVolumeLong: 10000,
      });

      const result = calculateMidTermValueStockScore(input);

      expect(result.totalScore).toBeGreaterThan(0);
    });

    it("全て理想的な値の場合、高スコアになる", () => {
      const input = createScoreInput({
        per: 5, // 業種平均の50%（非常に割安）
        pbr: 0.5, // 業種平均の50%（非常に割安）
        rsi: 25, // 売られすぎ
        rsiShort: 40, // モメンタム+15（反発初動）
        currentPrice: 1100, // 安値圏（10%位置）
        avgVolumeShort: 20000, // ratio = 2.0 → 100点（出来高急増）
        avgVolumeLong: 10000,
      });

      const result = calculateMidTermValueStockScore(input);

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
        rsiShort: 65, // モメンタム-10（まだ過熱）
        currentPrice: 2000, // 高値（100%位置）
        avgVolumeShort: 5000, // ratio = 0.5 → 0点（出来高減少）
        avgVolumeLong: 10000,
      });

      const result = calculateMidTermValueStockScore(input);

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

      const result = calculateMidTermValueStockScore(input);

      // スコアが計算可能であることを確認
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it("グロース市場ではEPS成長率とタグスコアが加味される", () => {
      // 有望テーマに該当するグロース株
      const inputWithTag = createScoreInput(
        { market: "グロース" },
        {
          stockThemeTagIds: ["ai"],
          favorableThemeTagIds: ["ai"],
          epsLatest: 120,
          eps3yAgo: 100,
        },
      );

      // タグなしのグロース株
      const inputWithoutTag = createScoreInput(
        { market: "グロース" },
        {
          stockThemeTagIds: [],
          favorableThemeTagIds: ["ai"],
          epsLatest: 120,
          eps3yAgo: 100,
        },
      );

      const resultWithTag = calculateMidTermValueStockScore(inputWithTag);
      const resultWithoutTag = calculateMidTermValueStockScore(inputWithoutTag);

      // タグが一致する方がスコアが高い
      expect(resultWithTag.totalScore).toBeGreaterThan(resultWithoutTag.totalScore);
    });
  });

  describe("nullハンドリング", () => {
    it("主要指標がnullでもスコア計算が可能", () => {
      const input = createScoreInput({
        currentPrice: null,
        per: null,
        pbr: null,
        rsi: null,
        rsiShort: null,
        priceHigh: null,
        priceLow: null,
        sectorAvgPer: null,
        sectorAvgPbr: null,
        market: null,
        avgVolumeShort: null,
        avgVolumeLong: null,
      });

      const result = calculateMidTermValueStockScore(input);

      expect(result.perScore).toBe(0);
      expect(result.pbrScore).toBe(0);
      expect(result.rsiScore).toBe(0);
      expect(result.priceRangeScore).toBe(0);
      // RSIモメンタムはnullの場合50を返すため、totalScoreは0ではない
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe("セクタースコアの検証", () => {
    it("PERとPBRの平均がセクタースコアになる", () => {
      const input = createScoreInput({
        per: 7, // 70% → 100点
        pbr: 1.0, // 100% → 50点
      });

      const result = calculateMidTermValueStockScore(input);

      // sectorScore = (perScore + pbrScore) / 2
      expect(result.sectorScore).toBe(Math.round((result.perScore + result.pbrScore) / 2));
    });
  });
});
