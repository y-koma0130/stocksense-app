import { describe, expect, it } from "vitest";
import type { LongTermIndicatorDto } from "../../../application/dto/longTermIndicator.dto";
import type { MidTermIndicatorDto } from "../../../application/dto/midTermIndicator.dto";
import { isTrapStock } from "../isTrapStock.service";

// テスト用の中期指標データ
const createMidTermIndicator = (
  overrides: Partial<MidTermIndicatorDto> = {},
): MidTermIndicatorDto => ({
  stockId: "test-stock-id",
  tickerCode: "1234",
  tickerSymbol: "1234.T",
  name: "テスト株式会社",
  sectorCode: "3050",
  sectorName: "情報・通信業",
  market: "プライム",
  collectedAt: "2024-01-01",
  periodType: "mid_term",
  currentPrice: 1500,
  per: 10,
  pbr: 1.0,
  rsi: 50,
  rsiShort: 50,
  priceHigh: 2000,
  priceLow: 1000,
  avgVolumeShort: 50000,
  avgVolumeLong: 50000,
  sectorAvgPer: 12,
  sectorAvgPbr: 1.2,
  equityRatio: 40,
  roe: 8,
  operatingIncomeDeclineYears: 0,
  operatingCashFlowNegativeYears: 0,
  revenueDeclineYears: 0,
  epsLatest: 100,
  eps3yAgo: 80,
  macroTagIds: [],
  themeTagIds: [],
  ...overrides,
});

// テスト用の長期指標データ
const createLongTermIndicator = (
  overrides: Partial<LongTermIndicatorDto> = {},
): LongTermIndicatorDto => ({
  stockId: "test-stock-id",
  tickerCode: "1234",
  tickerSymbol: "1234.T",
  name: "テスト株式会社",
  sectorCode: "3050",
  sectorName: "情報・通信業",
  market: "プライム",
  collectedAt: "2024-01-01",
  periodType: "long_term",
  currentPrice: 1500,
  per: 10,
  pbr: 1.0,
  rsi: 50,
  priceHigh: 2000,
  priceLow: 1000,
  avgVolumeShort: 50000,
  sectorAvgPer: 12,
  sectorAvgPbr: 1.2,
  equityRatio: 40,
  roe: 8,
  operatingIncomeDeclineYears: 0,
  operatingCashFlowNegativeYears: 0,
  revenueDeclineYears: 0,
  epsLatest: 100,
  eps3yAgo: 80,
  macroTagIds: [],
  themeTagIds: [],
  ...overrides,
});

describe("isTrapStock", () => {
  describe("出来高による罠株判定（中期）", () => {
    it("プライム市場で出来高が30,000株以下の場合、罠株と判定される", () => {
      const indicator = createMidTermIndicator({
        market: "プライム",
        avgVolumeShort: 25000,
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons).toContain("短期平均出来高が30,000株以下 (25,000株)");
    });

    it("プライム市場で出来高が30,000株を超える場合、出来高では罠株と判定されない", () => {
      const indicator = createMidTermIndicator({
        market: "プライム",
        avgVolumeShort: 50000,
        // 他の財務指標も健全に
        equityRatio: 40,
        roe: 8,
        operatingIncomeDeclineYears: 0,
        operatingCashFlowNegativeYears: 0,
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(false);
    });

    it("スタンダード市場で出来高が7,000株以下の場合、罠株と判定される", () => {
      const indicator = createMidTermIndicator({
        market: "スタンダード",
        avgVolumeShort: 5000,
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons).toContain("短期平均出来高が7,000株以下 (5,000株)");
    });

    it("グロース市場で出来高が5,000株以下の場合、罠株と判定される", () => {
      const indicator = createMidTermIndicator({
        market: "グロース",
        avgVolumeShort: 3000,
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons).toContain("短期平均出来高が5,000株以下 (3,000株)");
    });

    it("出来高がnullの場合、出来高チェックはスキップされる", () => {
      const indicator = createMidTermIndicator({
        avgVolumeShort: null,
        // 他の財務指標も健全に
        equityRatio: 40,
        roe: 8,
        operatingIncomeDeclineYears: 0,
        operatingCashFlowNegativeYears: 0,
      });

      const result = isTrapStock(indicator);

      // 出来高が原因の罠株判定はない
      expect(result.reasons.filter((r) => r.includes("出来高"))).toHaveLength(0);
    });
  });

  describe("出来高による罠株判定（長期）", () => {
    it("長期指標でも出来高チェックが適用される", () => {
      const indicator = createLongTermIndicator({
        market: "プライム",
        avgVolumeShort: 25000,
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons).toContain("短期平均出来高が30,000株以下 (25,000株)");
    });

    it("長期指標で出来高が十分な場合、出来高では罠株と判定されない", () => {
      const indicator = createLongTermIndicator({
        market: "プライム",
        avgVolumeShort: 50000,
        // 他の財務指標も健全に
        equityRatio: 40,
        roe: 8,
        operatingIncomeDeclineYears: 0,
        operatingCashFlowNegativeYears: 0,
      });

      const result = isTrapStock(indicator);

      expect(result.reasons.filter((r) => r.includes("出来高"))).toHaveLength(0);
    });
  });

  describe("財務健全性による罠株判定", () => {
    it("自己資本比率が低い場合、罠株と判定される", () => {
      const indicator = createMidTermIndicator({
        market: "プライム",
        equityRatio: 20, // 25%未満
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons.some((r) => r.includes("自己資本比率"))).toBe(true);
    });

    it("ROEが低い場合（プライムのみ）、罠株と判定される", () => {
      const indicator = createMidTermIndicator({
        market: "プライム",
        roe: 2, // 3%未満
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons.some((r) => r.includes("ROE"))).toBe(true);
    });

    it("営業利益が連続減少している場合、罠株と判定される", () => {
      const indicator = createMidTermIndicator({
        market: "プライム",
        operatingIncomeDeclineYears: 3,
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons.some((r) => r.includes("営業利益"))).toBe(true);
    });

    it("営業CFが連続マイナスの場合、罠株と判定される", () => {
      const indicator = createMidTermIndicator({
        market: "プライム",
        operatingCashFlowNegativeYears: 2,
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons.some((r) => r.includes("営業CF"))).toBe(true);
    });
  });

  describe("市場別の閾値差異", () => {
    it("グロース市場では自己資本比率10%が閾値", () => {
      const indicatorOk = createMidTermIndicator({
        market: "グロース",
        equityRatio: 15,
        avgVolumeShort: 10000, // グロースの閾値超え
        operatingCashFlowNegativeYears: 0,
        revenueDeclineYears: 0,
      });
      const indicatorNg = createMidTermIndicator({
        market: "グロース",
        equityRatio: 8,
        avgVolumeShort: 10000,
      });

      expect(isTrapStock(indicatorOk).isTrap).toBe(false);
      expect(isTrapStock(indicatorNg).isTrap).toBe(true);
    });

    it("グロース市場では売上減少がチェックされる", () => {
      const indicator = createMidTermIndicator({
        market: "グロース",
        revenueDeclineYears: 3,
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons.some((r) => r.includes("売上"))).toBe(true);
    });
  });

  describe("複合条件", () => {
    it("複数の条件に該当する場合、全ての理由が記録される", () => {
      const indicator = createMidTermIndicator({
        market: "プライム",
        avgVolumeShort: 25000, // 出来高不足
        equityRatio: 20, // 自己資本比率不足
        roe: 2, // ROE不足
      });

      const result = isTrapStock(indicator);

      expect(result.isTrap).toBe(true);
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
      expect(result.reasons.some((r) => r.includes("出来高"))).toBe(true);
      expect(result.reasons.some((r) => r.includes("自己資本比率"))).toBe(true);
      expect(result.reasons.some((r) => r.includes("ROE"))).toBe(true);
    });
  });
});
