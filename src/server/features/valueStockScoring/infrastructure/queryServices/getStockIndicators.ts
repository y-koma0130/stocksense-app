import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { stockFinancialHealth, stockIndicators, stocks } from "@/db/schema";
import {
  type StockIndicatorDto,
  stockIndicatorDtoSchema,
} from "../../application/dto/stockIndicator.dto";

/**
 * 指定した期間タイプの最新の銘柄指標データを全件取得する関数の型定義
 */
export type GetLatestStockIndicators = (
  periodType: "weekly" | "monthly",
) => Promise<StockIndicatorDto[]>;

/**
 * 指定した期間タイプの最新の銘柄指標データを全件取得する
 * 最新のcollectedAtの日付のデータを取得
 */
export const getLatestStockIndicators: GetLatestStockIndicators = async (periodType) => {
  // 指定した期間タイプの最新のcollectedAt日付を取得
  const latestDateResult = await db
    .select({ collectedAt: stockIndicators.collectedAt })
    .from(stockIndicators)
    .where(eq(stockIndicators.periodType, periodType))
    .orderBy(desc(stockIndicators.collectedAt))
    .limit(1);

  if (latestDateResult.length === 0) {
    return [];
  }

  const latestDate = latestDateResult[0].collectedAt;

  // 最新日付かつ指定した期間タイプのデータを取得
  // 財務健全性データはLEFT JOINで結合（存在しない場合もある）
  const results = await db
    .select({
      stockId: stockIndicators.stockId,
      tickerCode: stocks.tickerCode,
      tickerSymbol: stocks.tickerSymbol,
      name: stocks.name,
      sectorCode: stocks.sectorCode,
      sectorName: stocks.sectorName,
      market: stocks.market,
      collectedAt: stockIndicators.collectedAt,
      periodType: stockIndicators.periodType,
      currentPrice: stockIndicators.currentPrice,
      per: stockIndicators.per,
      pbr: stockIndicators.pbr,
      rsi: stockIndicators.rsi,
      week52High: stockIndicators.week52High,
      week52Low: stockIndicators.week52Low,
      sectorAvgPer: stockIndicators.sectorAvgPer,
      sectorAvgPbr: stockIndicators.sectorAvgPbr,
      // 財務健全性データ（別テーブルからJOIN）
      equityRatio: stockFinancialHealth.equityRatio,
      roe: stockFinancialHealth.roe,
      operatingIncomeDeclineYears: stockFinancialHealth.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: stockFinancialHealth.operatingCashFlowNegativeYears,
      revenueDeclineYears: stockFinancialHealth.revenueDeclineYears,
    })
    .from(stockIndicators)
    .innerJoin(stocks, eq(stockIndicators.stockId, stocks.id))
    .leftJoin(stockFinancialHealth, eq(stockIndicators.stockId, stockFinancialHealth.stockId))
    .where(
      and(eq(stockIndicators.collectedAt, latestDate), eq(stockIndicators.periodType, periodType)),
    );

  // DTOに変換してバリデーション
  return results.map((row) =>
    stockIndicatorDtoSchema.parse({
      stockId: row.stockId,
      tickerCode: row.tickerCode,
      tickerSymbol: row.tickerSymbol,
      name: row.name,
      sectorCode: row.sectorCode,
      sectorName: row.sectorName,
      market: row.market,
      collectedAt: row.collectedAt,
      periodType: row.periodType,
      currentPrice: row.currentPrice ? Number(row.currentPrice) : null,
      per: row.per ? Number(row.per) : null,
      pbr: row.pbr ? Number(row.pbr) : null,
      rsi: row.rsi ? Number(row.rsi) : null,
      week52High: row.week52High ? Number(row.week52High) : null,
      week52Low: row.week52Low ? Number(row.week52Low) : null,
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
