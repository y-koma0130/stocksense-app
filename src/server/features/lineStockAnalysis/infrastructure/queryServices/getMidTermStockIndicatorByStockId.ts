/**
 * 特定銘柄の中期指標データを取得するクエリサービス
 */

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { midTermIndicators, sectorAverages, stockFinancialHealth, stocks } from "@/db/schema";
import {
  type MidTermStockIndicatorDto,
  midTermStockIndicatorDtoSchema,
} from "../../application/dto/midTermStockIndicator.dto";

/**
 * 中期指標を取得する関数の型定義
 */
export type GetMidTermStockIndicatorByStockId = (
  stockId: string,
) => Promise<MidTermStockIndicatorDto | null>;

/**
 * 特定銘柄の最新中期指標を取得
 */
export const getMidTermStockIndicatorByStockId: GetMidTermStockIndicatorByStockId = async (
  stockId,
) => {
  // 最新のcollectedAt日付を取得
  const latestDateResult = await db
    .select({ collectedAt: midTermIndicators.collectedAt })
    .from(midTermIndicators)
    .orderBy(desc(midTermIndicators.collectedAt))
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
      stockId: midTermIndicators.stockId,
      tickerCode: stocks.tickerCode,
      name: stocks.name,
      sectorCode: stocks.sectorCode,
      sectorName: stocks.sectorName,
      market: stocks.market,
      currentPrice: midTermIndicators.currentPrice,
      per: midTermIndicators.per,
      pbr: midTermIndicators.pbr,
      rsi: midTermIndicators.rsi,
      rsiShort: midTermIndicators.rsiShort,
      priceHigh: midTermIndicators.priceHigh,
      priceLow: midTermIndicators.priceLow,
      sectorAvgPer: sectorAverages.avgPer,
      sectorAvgPbr: sectorAverages.avgPbr,
      epsLatest: stockFinancialHealth.epsLatest,
      eps3yAgo: stockFinancialHealth.eps3yAgo,
    })
    .from(midTermIndicators)
    .innerJoin(stocks, eq(midTermIndicators.stockId, stocks.id))
    .leftJoin(
      sectorAverages,
      and(
        eq(midTermIndicators.sectorCode, sectorAverages.sectorCode),
        eq(sectorAverages.dataDate, latestSectorDate),
      ),
    )
    .leftJoin(stockFinancialHealth, eq(midTermIndicators.stockId, stockFinancialHealth.stockId))
    .where(
      and(eq(midTermIndicators.collectedAt, latestDate), eq(midTermIndicators.stockId, stockId)),
    )
    .limit(1);

  if (results.length === 0) {
    return null;
  }

  const row = results[0];
  return midTermStockIndicatorDtoSchema.parse({
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
    rsiShort: row.rsiShort ? Number(row.rsiShort) : null,
    priceHigh: row.priceHigh ? Number(row.priceHigh) : null,
    priceLow: row.priceLow ? Number(row.priceLow) : null,
    sectorAvgPer: row.sectorAvgPer ? Number(row.sectorAvgPer) : null,
    sectorAvgPbr: row.sectorAvgPbr ? Number(row.sectorAvgPbr) : null,
    epsLatest: row.epsLatest ? Number(row.epsLatest) : null,
    eps3yAgo: row.eps3yAgo ? Number(row.eps3yAgo) : null,
  });
};
