import { describe, expect, it } from "vitest";
import type { LongTermIndicatorDto } from "../../../application/dto/indicator.dto";
import { LONG_TERM_CONFIG } from "../../values/scoringConfig";
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
  ...overrides,
});

describe("calculateLongTermValueStockScore", () => {
  describe("基本スコアリング", () => {
    it("標準的な割安株のスコアを計算できる", () => {
      const indicator = createBaseLongTermIndicator();

      const result = calculateLongTermValueStockScore(indicator);

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

    it("EPS成長率が高い銘柄は高スコアになる", () => {
      const highGrowthIndicator = createBaseLongTermIndicator({
        epsLatest: 172.8, // 20%成長（1.2^3）
        eps3yAgo: 100,
      });
      const lowGrowthIndicator = createBaseLongTermIndicator({
        epsLatest: 110,
        eps3yAgo: 100, // 約3%成長
      });

      const resultHigh = calculateLongTermValueStockScore(highGrowthIndicator);
      const resultLow = calculateLongTermValueStockScore(lowGrowthIndicator);

      expect(resultHigh.totalScore).toBeGreaterThan(resultLow.totalScore);
    });

    it("EPS成長率が計算できない場合、中央値が使用される", () => {
      const noEpsIndicator = createBaseLongTermIndicator({
        epsLatest: null,
        eps3yAgo: null,
      });

      const result = calculateLongTermValueStockScore(noEpsIndicator);

      // スコアは計算可能（中央値50が使用される）
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it("全て理想的な値の場合、高スコアになる", () => {
      const idealIndicator = createBaseLongTermIndicator({
        per: 5, // 業種平均の50%（非常に割安）
        pbr: 0.5, // 業種平均の50%（非常に割安）
        rsi: 25, // 売られすぎ
        currentPrice: 1100, // 安値圏（10%位置）
        epsLatest: 172.8, // 20%成長
        eps3yAgo: 100,
      });

      const result = calculateLongTermValueStockScore(idealIndicator);

      expect(result.perScore).toBe(100);
      expect(result.pbrScore).toBe(100);
      expect(result.rsiScore).toBe(100);
      expect(result.priceRangeScore).toBe(100);
      expect(result.totalScore).toBeGreaterThanOrEqual(0.9);
    });

    it("全て悪い値の場合、低スコアになる", () => {
      const poorIndicator = createBaseLongTermIndicator({
        per: 20, // 業種平均の200%（割高）
        pbr: 2.0, // 業種平均の200%（割高）
        rsi: 75, // 買われすぎ
        currentPrice: 2000, // 高値（100%位置）
        epsLatest: 80, // -7%成長
        eps3yAgo: 100,
      });

      const result = calculateLongTermValueStockScore(poorIndicator);

      expect(result.perScore).toBe(0);
      expect(result.pbrScore).toBe(0);
      expect(result.rsiScore).toBe(0);
      expect(result.priceRangeScore).toBe(0);
      expect(result.totalScore).toBeLessThan(0.2);
    });
  });

  describe("重み付けの検証", () => {
    it("長期設定の重み合計が100%になる", () => {
      const totalWeight =
        LONG_TERM_CONFIG.perWeight +
        LONG_TERM_CONFIG.pbrWeight +
        LONG_TERM_CONFIG.rsiWeight +
        LONG_TERM_CONFIG.priceRangeWeight +
        (LONG_TERM_CONFIG.epsGrowthWeight ?? 0);

      expect(totalWeight).toBe(100);
    });
  });

  describe("市場別補正の検証", () => {
    it("グロース市場ではPERスコアに1.2倍の補正がかかる", () => {
      const primeIndicator = createBaseLongTermIndicator({
        market: "プライム",
        per: 10, // 業種平均と同等
      });
      const growthIndicator = createBaseLongTermIndicator({
        market: "グロース",
        per: 10, // 業種平均と同等
      });

      const resultPrime = calculateLongTermValueStockScore(primeIndicator);
      const resultGrowth = calculateLongTermValueStockScore(growthIndicator);

      // グロース市場はPERスコアに1.2倍補正
      expect(resultGrowth.perScore).toBeGreaterThan(resultPrime.perScore);
    });

    it("グロース市場ではPBRスコアに0.8倍の補正がかかる", () => {
      const primeIndicator = createBaseLongTermIndicator({
        market: "プライム",
        pbr: 1.0, // 業種平均と同等
      });
      const growthIndicator = createBaseLongTermIndicator({
        market: "グロース",
        pbr: 1.0, // 業種平均と同等
      });

      const resultPrime = calculateLongTermValueStockScore(primeIndicator);
      const resultGrowth = calculateLongTermValueStockScore(growthIndicator);

      // グロース市場はPBRスコアに0.8倍補正
      expect(resultGrowth.pbrScore).toBeLessThan(resultPrime.pbrScore);
    });
  });

  describe("nullハンドリング", () => {
    it("主要指標がnullでもスコア計算が可能", () => {
      const nullIndicator = createBaseLongTermIndicator({
        currentPrice: null,
        per: null,
        pbr: null,
        rsi: null,
        priceHigh: null,
        priceLow: null,
        sectorAvgPer: null,
        sectorAvgPbr: null,
        market: null,
        epsLatest: null,
        eps3yAgo: null,
      });

      const result = calculateLongTermValueStockScore(nullIndicator);

      expect(result.perScore).toBe(0);
      expect(result.pbrScore).toBe(0);
      expect(result.rsiScore).toBe(0);
      expect(result.priceRangeScore).toBe(0);
      // EPS成長率はnullの場合50を返すため、totalScoreは0ではない
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe("セクタースコアの検証", () => {
    it("PERとPBRの平均がセクタースコアになる", () => {
      const indicator = createBaseLongTermIndicator({
        per: 7, // 70% → 100点
        pbr: 1.0, // 100% → 50点
      });

      const result = calculateLongTermValueStockScore(indicator);

      // sectorScore = (perScore + pbrScore) / 2
      expect(result.sectorScore).toBe(Math.round((result.perScore + result.pbrScore) / 2));
    });
  });
});
