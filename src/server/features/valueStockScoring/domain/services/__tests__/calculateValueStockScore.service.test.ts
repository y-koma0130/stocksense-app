import { describe, expect, it } from "vitest";
import { LONG_TERM_CONFIG, MID_TERM_CONFIG } from "../../values/scoringConfig";
import type { ScoringIndicator } from "../calculateValueStockScore.service";
import { calculateValueStockScore } from "../calculateValueStockScore.service";

// テスト用の基本的な銘柄データ
const createBaseIndicator = (overrides: Partial<ScoringIndicator> = {}): ScoringIndicator => ({
  currentPrice: 1500,
  per: 8, // 業種平均の80%（良好）
  pbr: 0.8, // 業種平均の80%（良好）
  rsi: 35, // 売られすぎに近い
  rsiShort: null,
  priceHigh: 2000,
  priceLow: 1000,
  sectorAvgPer: 10,
  sectorAvgPbr: 1.0,
  market: "プライム",
  epsLatest: null,
  eps3yAgo: null,
  ...overrides,
});

describe("calculateValueStockScore", () => {
  describe("中期スコアリング（MID_TERM_CONFIG）", () => {
    it("標準的な割安株のスコアを計算できる", () => {
      const indicator = createBaseIndicator({
        rsiShort: 40, // RSIモメンタム = 40 - 35 = +5
      });

      const result = calculateValueStockScore(indicator, MID_TERM_CONFIG);

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
      const indicatorWithPositiveMomentum = createBaseIndicator({
        rsiShort: 55, // momentum = +20
      });
      const indicatorWithNegativeMomentum = createBaseIndicator({
        rsiShort: 20, // momentum = -15
      });

      const resultPositive = calculateValueStockScore(
        indicatorWithPositiveMomentum,
        MID_TERM_CONFIG,
      );
      const resultNegative = calculateValueStockScore(
        indicatorWithNegativeMomentum,
        MID_TERM_CONFIG,
      );

      expect(resultPositive.totalScore).toBeGreaterThan(resultNegative.totalScore);
    });

    it("全て理想的な値の場合、高スコアになる", () => {
      const idealIndicator = createBaseIndicator({
        per: 5, // 業種平均の50%（非常に割安）
        pbr: 0.5, // 業種平均の50%（非常に割安）
        rsi: 25, // 売られすぎ
        rsiShort: 40, // モメンタム+15（反発初動）
        currentPrice: 1100, // 安値圏（10%位置）
      });

      const result = calculateValueStockScore(idealIndicator, MID_TERM_CONFIG);

      expect(result.perScore).toBe(100);
      expect(result.pbrScore).toBe(100);
      expect(result.rsiScore).toBe(100);
      expect(result.priceRangeScore).toBe(100);
      expect(result.totalScore).toBeGreaterThanOrEqual(0.9);
    });

    it("全て悪い値の場合、低スコアになる", () => {
      const poorIndicator = createBaseIndicator({
        per: 20, // 業種平均の200%（割高）
        pbr: 2.0, // 業種平均の200%（割高）
        rsi: 75, // 買われすぎ
        rsiShort: 65, // モメンタム-10（まだ過熱）
        currentPrice: 2000, // 高値（100%位置）
      });

      const result = calculateValueStockScore(poorIndicator, MID_TERM_CONFIG);

      expect(result.perScore).toBe(0);
      expect(result.pbrScore).toBe(0);
      expect(result.rsiScore).toBe(0);
      expect(result.priceRangeScore).toBe(0);
      expect(result.totalScore).toBeLessThan(0.2);
    });
  });

  describe("長期スコアリング（LONG_TERM_CONFIG）", () => {
    it("EPS成長率が高い銘柄は高スコアになる", () => {
      const highGrowthIndicator = createBaseIndicator({
        epsLatest: 172.8, // 20%成長（1.2^3）
        eps3yAgo: 100,
      });
      const lowGrowthIndicator = createBaseIndicator({
        epsLatest: 110,
        eps3yAgo: 100, // 約3%成長
      });

      const resultHigh = calculateValueStockScore(highGrowthIndicator, LONG_TERM_CONFIG);
      const resultLow = calculateValueStockScore(lowGrowthIndicator, LONG_TERM_CONFIG);

      expect(resultHigh.totalScore).toBeGreaterThan(resultLow.totalScore);
    });

    it("EPS成長率が計算できない場合、中央値が使用される", () => {
      const noEpsIndicator = createBaseIndicator({
        epsLatest: null,
        eps3yAgo: null,
      });

      const result = calculateValueStockScore(noEpsIndicator, LONG_TERM_CONFIG);

      // スコアは計算可能（中央値50が使用される）
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it("長期設定ではRSIモメンタムが無視される", () => {
      const indicatorWithMomentum = createBaseIndicator({
        rsiShort: 60, // 大きなプラスモメンタム
      });
      const indicatorWithoutMomentum = createBaseIndicator({
        rsiShort: null,
      });

      const resultWith = calculateValueStockScore(indicatorWithMomentum, LONG_TERM_CONFIG);
      const resultWithout = calculateValueStockScore(indicatorWithoutMomentum, LONG_TERM_CONFIG);

      // 長期設定ではrsiMomentumWeightがないので、rsiShortは影響しない
      expect(resultWith.totalScore).toBe(resultWithout.totalScore);
    });
  });

  describe("重み付けの検証", () => {
    it("中期設定の重み合計が100%になる", () => {
      const totalWeight =
        MID_TERM_CONFIG.perWeight +
        MID_TERM_CONFIG.pbrWeight +
        MID_TERM_CONFIG.rsiWeight +
        MID_TERM_CONFIG.priceRangeWeight +
        (MID_TERM_CONFIG.rsiMomentumWeight ?? 0);

      expect(totalWeight).toBe(100);
    });

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
      const primeIndicator = createBaseIndicator({
        market: "プライム",
        per: 10, // 業種平均と同等
      });
      const growthIndicator = createBaseIndicator({
        market: "グロース",
        per: 10, // 業種平均と同等
      });

      const resultPrime = calculateValueStockScore(primeIndicator, MID_TERM_CONFIG);
      const resultGrowth = calculateValueStockScore(growthIndicator, MID_TERM_CONFIG);

      // グロース市場はPERスコアに1.2倍補正
      expect(resultGrowth.perScore).toBeGreaterThan(resultPrime.perScore);
    });

    it("グロース市場ではPBRスコアに0.8倍の補正がかかる", () => {
      const primeIndicator = createBaseIndicator({
        market: "プライム",
        pbr: 1.0, // 業種平均と同等
      });
      const growthIndicator = createBaseIndicator({
        market: "グロース",
        pbr: 1.0, // 業種平均と同等
      });

      const resultPrime = calculateValueStockScore(primeIndicator, MID_TERM_CONFIG);
      const resultGrowth = calculateValueStockScore(growthIndicator, MID_TERM_CONFIG);

      // グロース市場はPBRスコアに0.8倍補正
      expect(resultGrowth.pbrScore).toBeLessThan(resultPrime.pbrScore);
    });
  });

  describe("nullハンドリング", () => {
    it("全ての指標がnullでもスコア計算が可能", () => {
      const nullIndicator: ScoringIndicator = {
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
        epsLatest: null,
        eps3yAgo: null,
      };

      const result = calculateValueStockScore(nullIndicator, MID_TERM_CONFIG);

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
      const indicator = createBaseIndicator({
        per: 7, // 70% → 100点
        pbr: 1.0, // 100% → 50点
      });

      const result = calculateValueStockScore(indicator, MID_TERM_CONFIG);

      // sectorScore = (perScore + pbrScore) / 2
      expect(result.sectorScore).toBe(Math.round((result.perScore + result.pbrScore) / 2));
    });
  });
});
