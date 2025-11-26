import { and, desc, eq } from "drizzle-orm";
import type { PeriodType } from "@/constants/periodTypes";
import { PERIOD_TYPES } from "@/constants/periodTypes";
import { db } from "@/db";
import {
  longTermIndicators,
  midTermIndicators,
  sectorAverages,
  stockFinancialHealth,
  stocks,
} from "@/db/schema";
import {
  type IndicatorDto,
  longTermIndicatorDtoSchema,
  midTermIndicatorDtoSchema,
} from "../../application/dto/indicator.dto";

/**
 * 指定した期間タイプの最新の指標データを全件取得する関数の型定義
 */
export type GetLatestIndicators = (periodType: PeriodType) => Promise<IndicatorDto[]>;

/**
 * 中期指標の最新データを取得
 */
const getLatestMidTermIndicators = async (): Promise<IndicatorDto[]> => {
  // 最新のcollectedAt日付を取得
  const latestDateResult = await db
    .select({ collectedAt: midTermIndicators.collectedAt })
    .from(midTermIndicators)
    .orderBy(desc(midTermIndicators.collectedAt))
    .limit(1);

  if (latestDateResult.length === 0) {
    return [];
  }

  const latestDate = latestDateResult[0].collectedAt;

  // 最新日付のデータを取得
  // sector_averagesとstockFinancialHealthはLEFT JOINで結合
  const results = await db
    .select({
      stockId: midTermIndicators.stockId,
      tickerCode: stocks.tickerCode,
      tickerSymbol: stocks.tickerSymbol,
      name: stocks.name,
      sectorCode: stocks.sectorCode,
      sectorName: stocks.sectorName,
      market: stocks.market,
      collectedAt: midTermIndicators.collectedAt,
      currentPrice: midTermIndicators.currentPrice,
      per: midTermIndicators.per,
      pbr: midTermIndicators.pbr,
      rsi: midTermIndicators.rsi,
      priceHigh: midTermIndicators.priceHigh,
      priceLow: midTermIndicators.priceLow,
      // sector_averagesから業種平均を取得
      sectorAvgPer: sectorAverages.avgPer,
      sectorAvgPbr: sectorAverages.avgPbr,
      // 財務健全性データ
      equityRatio: stockFinancialHealth.equityRatio,
      roe: stockFinancialHealth.roe,
      operatingIncomeDeclineYears: stockFinancialHealth.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: stockFinancialHealth.operatingCashFlowNegativeYears,
      revenueDeclineYears: stockFinancialHealth.revenueDeclineYears,
    })
    .from(midTermIndicators)
    .innerJoin(stocks, eq(midTermIndicators.stockId, stocks.id))
    .leftJoin(
      sectorAverages,
      and(
        eq(midTermIndicators.sectorCode, sectorAverages.sectorCode),
        eq(midTermIndicators.collectedAt, sectorAverages.dataDate),
      ),
    )
    .leftJoin(stockFinancialHealth, eq(midTermIndicators.stockId, stockFinancialHealth.stockId))
    .where(eq(midTermIndicators.collectedAt, latestDate));

  // DTOに変換
  return results.map((row) =>
    midTermIndicatorDtoSchema.parse({
      stockId: row.stockId,
      tickerCode: row.tickerCode,
      tickerSymbol: row.tickerSymbol,
      name: row.name,
      sectorCode: row.sectorCode,
      sectorName: row.sectorName,
      market: row.market,
      collectedAt: row.collectedAt,
      periodType: "mid_term",
      currentPrice: row.currentPrice ? Number(row.currentPrice) : null,
      per: row.per ? Number(row.per) : null,
      pbr: row.pbr ? Number(row.pbr) : null,
      rsi: row.rsi ? Number(row.rsi) : null,
      priceHigh: row.priceHigh ? Number(row.priceHigh) : null,
      priceLow: row.priceLow ? Number(row.priceLow) : null,
      sectorAvgPer: row.sectorAvgPer ? Number(row.sectorAvgPer) : null,
      sectorAvgPbr: row.sectorAvgPbr ? Number(row.sectorAvgPbr) : null,
      equityRatio: row.equityRatio ? Number(row.equityRatio) : null,
      roe: row.roe ? Number(row.roe) : null,
      operatingIncomeDeclineYears: row.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: row.operatingCashFlowNegativeYears,
      revenueDeclineYears: row.revenueDeclineYears,
    }),
  );
};

/**
 * 長期指標の最新データを取得
 */
const getLatestLongTermIndicators = async (): Promise<IndicatorDto[]> => {
  // 最新のcollectedAt日付を取得
  const latestDateResult = await db
    .select({ collectedAt: longTermIndicators.collectedAt })
    .from(longTermIndicators)
    .orderBy(desc(longTermIndicators.collectedAt))
    .limit(1);

  if (latestDateResult.length === 0) {
    return [];
  }

  const latestDate = latestDateResult[0].collectedAt;

  // 最新日付のデータを取得
  const results = await db
    .select({
      stockId: longTermIndicators.stockId,
      tickerCode: stocks.tickerCode,
      tickerSymbol: stocks.tickerSymbol,
      name: stocks.name,
      sectorCode: stocks.sectorCode,
      sectorName: stocks.sectorName,
      market: stocks.market,
      collectedAt: longTermIndicators.collectedAt,
      currentPrice: longTermIndicators.currentPrice,
      per: longTermIndicators.per,
      pbr: longTermIndicators.pbr,
      rsi: longTermIndicators.rsi,
      priceHigh: longTermIndicators.priceHigh,
      priceLow: longTermIndicators.priceLow,
      // sector_averagesから業種平均を取得
      sectorAvgPer: sectorAverages.avgPer,
      sectorAvgPbr: sectorAverages.avgPbr,
      // 財務健全性データ
      equityRatio: stockFinancialHealth.equityRatio,
      roe: stockFinancialHealth.roe,
      operatingIncomeDeclineYears: stockFinancialHealth.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: stockFinancialHealth.operatingCashFlowNegativeYears,
      revenueDeclineYears: stockFinancialHealth.revenueDeclineYears,
    })
    .from(longTermIndicators)
    .innerJoin(stocks, eq(longTermIndicators.stockId, stocks.id))
    .leftJoin(
      sectorAverages,
      and(
        eq(longTermIndicators.sectorCode, sectorAverages.sectorCode),
        eq(longTermIndicators.collectedAt, sectorAverages.dataDate),
      ),
    )
    .leftJoin(stockFinancialHealth, eq(longTermIndicators.stockId, stockFinancialHealth.stockId))
    .where(eq(longTermIndicators.collectedAt, latestDate));

  // DTOに変換
  return results.map((row) =>
    longTermIndicatorDtoSchema.parse({
      stockId: row.stockId,
      tickerCode: row.tickerCode,
      tickerSymbol: row.tickerSymbol,
      name: row.name,
      sectorCode: row.sectorCode,
      sectorName: row.sectorName,
      market: row.market,
      collectedAt: row.collectedAt,
      periodType: "long_term",
      currentPrice: row.currentPrice ? Number(row.currentPrice) : null,
      per: row.per ? Number(row.per) : null,
      pbr: row.pbr ? Number(row.pbr) : null,
      rsi: row.rsi ? Number(row.rsi) : null,
      priceHigh: row.priceHigh ? Number(row.priceHigh) : null,
      priceLow: row.priceLow ? Number(row.priceLow) : null,
      sectorAvgPer: row.sectorAvgPer ? Number(row.sectorAvgPer) : null,
      sectorAvgPbr: row.sectorAvgPbr ? Number(row.sectorAvgPbr) : null,
      equityRatio: row.equityRatio ? Number(row.equityRatio) : null,
      roe: row.roe ? Number(row.roe) : null,
      operatingIncomeDeclineYears: row.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: row.operatingCashFlowNegativeYears,
      revenueDeclineYears: row.revenueDeclineYears,
    }),
  );
};

/**
 * 指定した期間タイプの最新の指標データを全件取得する
 */
export const getLatestIndicators: GetLatestIndicators = async (periodType) => {
  if (periodType === PERIOD_TYPES.MID_TERM) {
    return getLatestMidTermIndicators();
  } else {
    return getLatestLongTermIndicators();
  }
};
