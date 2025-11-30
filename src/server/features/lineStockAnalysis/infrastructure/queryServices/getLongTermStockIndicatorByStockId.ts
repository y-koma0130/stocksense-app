/**
 * 特定銘柄の長期指標データを取得するクエリサービス
 */

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { longTermIndicators, sectorAverages, stockFinancialHealth, stocks } from "@/db/schema";
import {
  type LongTermStockIndicatorDto,
  longTermStockIndicatorDtoSchema,
} from "../../application/dto/longTermStockIndicator.dto";

/**
 * 長期指標を取得する関数の型定義
 */
export type GetLongTermStockIndicatorByStockId = (
  stockId: string,
) => Promise<LongTermStockIndicatorDto | null>;

/**
 * 特定銘柄の最新長期指標を取得
 */
export const getLongTermStockIndicatorByStockId: GetLongTermStockIndicatorByStockId = async (
  stockId,
) => {
  // 最新のcollectedAt日付を取得
  const latestDateResult = await db
    .select({ collectedAt: longTermIndicators.collectedAt })
    .from(longTermIndicators)
    .orderBy(desc(longTermIndicators.collectedAt))
    .limit(1);

  if (latestDateResult.length === 0) {
    return null;
  }

  const latestDate = latestDateResult[0].collectedAt;

  // sector_averagesの最新日付を取得
  const latestSectorDateResult = await db
    .select({ dataDate: sectorAverages.dataDate })
    .from(sectorAverages)
    .orderBy(desc(sectorAverages.dataDate))
    .limit(1);
  const latestSectorDate = latestSectorDateResult[0]?.dataDate;

  // 特定銘柄のデータを取得
  const results = await db
    .select({
      stockId: longTermIndicators.stockId,
      tickerCode: stocks.tickerCode,
      name: stocks.name,
      sectorCode: stocks.sectorCode,
      sectorName: stocks.sectorName,
      market: stocks.market,
      currentPrice: longTermIndicators.currentPrice,
      per: longTermIndicators.per,
      pbr: longTermIndicators.pbr,
      rsi: longTermIndicators.rsi,
      priceHigh: longTermIndicators.priceHigh,
      priceLow: longTermIndicators.priceLow,
      sectorAvgPer: sectorAverages.avgPer,
      sectorAvgPbr: sectorAverages.avgPbr,
      epsLatest: stockFinancialHealth.epsLatest,
      eps3yAgo: stockFinancialHealth.eps3yAgo,
    })
    .from(longTermIndicators)
    .innerJoin(stocks, eq(longTermIndicators.stockId, stocks.id))
    .leftJoin(
      sectorAverages,
      and(
        eq(longTermIndicators.sectorCode, sectorAverages.sectorCode),
        eq(sectorAverages.dataDate, latestSectorDate),
      ),
    )
    .leftJoin(stockFinancialHealth, eq(longTermIndicators.stockId, stockFinancialHealth.stockId))
    .where(
      and(eq(longTermIndicators.collectedAt, latestDate), eq(longTermIndicators.stockId, stockId)),
    )
    .limit(1);

  if (results.length === 0) {
    return null;
  }

  const row = results[0];
  return longTermStockIndicatorDtoSchema.parse({
    stockId: row.stockId,
    tickerCode: row.tickerCode,
    name: row.name,
    sectorCode: row.sectorCode,
    sectorName: row.sectorName,
    market: row.market,
    currentPrice: row.currentPrice ? Number(row.currentPrice) : null,
    per: row.per ? Number(row.per) : null,
    pbr: row.pbr ? Number(row.pbr) : null,
    rsi: row.rsi ? Number(row.rsi) : null,
    priceHigh: row.priceHigh ? Number(row.priceHigh) : null,
    priceLow: row.priceLow ? Number(row.priceLow) : null,
    sectorAvgPer: row.sectorAvgPer ? Number(row.sectorAvgPer) : null,
    sectorAvgPbr: row.sectorAvgPbr ? Number(row.sectorAvgPbr) : null,
    epsLatest: row.epsLatest ? Number(row.epsLatest) : null,
    eps3yAgo: row.eps3yAgo ? Number(row.eps3yAgo) : null,
  });
};
