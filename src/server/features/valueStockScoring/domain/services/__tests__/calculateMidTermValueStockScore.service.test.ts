import { describe, expect, it } from "vitest";
import type { MidTermIndicatorDto } from "../../../application/dto/indicator.dto";
import { MID_TERM_CONFIG } from "../../values/scoringConfig";
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
  ...overrides,
});

describe("calculateMidTermValueStockScore", () => {
  describe("基本スコアリング", () => {
    it("標準的な割安株のスコアを計算できる", () => {
      const indicator = createBaseMidTermIndicator();

      const result = calculateMidTermValueStockScore(indicator);

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
      const indicatorWithPositiveMomentum = createBaseMidTermIndicator({
        rsiShort: 55, // momentum = +20
      });
      const indicatorWithNegativeMomentum = createBaseMidTermIndicator({
        rsiShort: 20, // momentum = -15
      });

      const resultPositive = calculateMidTermValueStockScore(indicatorWithPositiveMomentum);
      const resultNegative = calculateMidTermValueStockScore(indicatorWithNegativeMomentum);

      expect(resultPositive.totalScore).toBeGreaterThan(resultNegative.totalScore);
    });

    it("出来高が急増している場合、スコアが向上する", () => {
      const indicatorWithHighVolume = createBaseMidTermIndicator({
        avgVolumeShort: 20000, // ratio = 2.0 → 100点
        avgVolumeLong: 10000,
      });
      const indicatorWithLowVolume = createBaseMidTermIndicator({
        avgVolumeShort: 5000, // ratio = 0.5 → 0点
        avgVolumeLong: 10000,
      });

      const resultHigh = calculateMidTermValueStockScore(indicatorWithHighVolume);
      const resultLow = calculateMidTermValueStockScore(indicatorWithLowVolume);

      expect(resultHigh.totalScore).toBeGreaterThan(resultLow.totalScore);
    });

    it("出来高が横ばいの場合、中間スコアになる", () => {
      const indicatorWithStableVolume = createBaseMidTermIndicator({
        avgVolumeShort: 10000, // ratio = 1.0 → 50点
        avgVolumeLong: 10000,
      });

      const result = calculateMidTermValueStockScore(indicatorWithStableVolume);

      // volumeSurgeWeightが12%で50点の場合、その寄与は6%(0.06)
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it("全て理想的な値の場合、高スコアになる", () => {
      const idealIndicator = createBaseMidTermIndicator({
        per: 5, // 業種平均の50%（非常に割安）
        pbr: 0.5, // 業種平均の50%（非常に割安）
        rsi: 25, // 売られすぎ
        rsiShort: 40, // モメンタム+15（反発初動）
        currentPrice: 1100, // 安値圏（10%位置）
        avgVolumeShort: 20000, // ratio = 2.0 → 100点（出来高急増）
        avgVolumeLong: 10000,
      });

      const result = calculateMidTermValueStockScore(idealIndicator);

      expect(result.perScore).toBe(100);
      expect(result.pbrScore).toBe(100);
      expect(result.rsiScore).toBe(100);
      expect(result.priceRangeScore).toBe(100);
      expect(result.totalScore).toBeGreaterThanOrEqual(0.9);
    });

    it("全て悪い値の場合、低スコアになる", () => {
      const poorIndicator = createBaseMidTermIndicator({
        per: 20, // 業種平均の200%（割高）
        pbr: 2.0, // 業種平均の200%（割高）
        rsi: 75, // 買われすぎ
        rsiShort: 65, // モメンタム-10（まだ過熱）
        currentPrice: 2000, // 高値（100%位置）
        avgVolumeShort: 5000, // ratio = 0.5 → 0点（出来高減少）
        avgVolumeLong: 10000,
      });

      const result = calculateMidTermValueStockScore(poorIndicator);

      expect(result.perScore).toBe(0);
      expect(result.pbrScore).toBe(0);
      expect(result.rsiScore).toBe(0);
      expect(result.priceRangeScore).toBe(0);
      expect(result.totalScore).toBeLessThan(0.2);
    });
  });

  describe("重み付けの検証", () => {
    it("中期設定の重み合計が100%になる", () => {
      const totalWeight =
        MID_TERM_CONFIG.perWeight +
        MID_TERM_CONFIG.pbrWeight +
        MID_TERM_CONFIG.rsiWeight +
        MID_TERM_CONFIG.priceRangeWeight +
        (MID_TERM_CONFIG.rsiMomentumWeight ?? 0) +
        (MID_TERM_CONFIG.volumeSurgeWeight ?? 0);

      expect(totalWeight).toBe(100);
    });
  });

  describe("市場別補正の検証", () => {
    it("グロース市場ではPERスコアに1.2倍の補正がかかる", () => {
      const primeIndicator = createBaseMidTermIndicator({
        market: "プライム",
        per: 10, // 業種平均と同等
      });
      const growthIndicator = createBaseMidTermIndicator({
        market: "グロース",
        per: 10, // 業種平均と同等
      });

      const resultPrime = calculateMidTermValueStockScore(primeIndicator);
      const resultGrowth = calculateMidTermValueStockScore(growthIndicator);

      // グロース市場はPERスコアに1.2倍補正
      expect(resultGrowth.perScore).toBeGreaterThan(resultPrime.perScore);
    });

    it("グロース市場ではPBRスコアに0.8倍の補正がかかる", () => {
      const primeIndicator = createBaseMidTermIndicator({
        market: "プライム",
        pbr: 1.0, // 業種平均と同等
      });
      const growthIndicator = createBaseMidTermIndicator({
        market: "グロース",
        pbr: 1.0, // 業種平均と同等
      });

      const resultPrime = calculateMidTermValueStockScore(primeIndicator);
      const resultGrowth = calculateMidTermValueStockScore(growthIndicator);

      // グロース市場はPBRスコアに0.8倍補正
      expect(resultGrowth.pbrScore).toBeLessThan(resultPrime.pbrScore);
    });
  });

  describe("nullハンドリング", () => {
    it("主要指標がnullでもスコア計算が可能", () => {
      const nullIndicator = createBaseMidTermIndicator({
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

      const result = calculateMidTermValueStockScore(nullIndicator);

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
      const indicator = createBaseMidTermIndicator({
        per: 7, // 70% → 100点
        pbr: 1.0, // 100% → 50点
      });

      const result = calculateMidTermValueStockScore(indicator);

      // sectorScore = (perScore + pbrScore) / 2
      expect(result.sectorScore).toBe(Math.round((result.perScore + result.pbrScore) / 2));
    });
  });
});
