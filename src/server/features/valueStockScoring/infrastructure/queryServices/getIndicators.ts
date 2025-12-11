import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  longTermIndicators,
  midTermIndicators,
  sectorAverages,
  stockFinancialHealth,
  stockMacroTags,
  stocks,
  stockThemeTags,
} from "@/db/schema";
import type { FilterConditionsInputDto } from "../../application/dto/filterConditionsInput.dto";
import {
  type LongTermIndicatorDto,
  longTermIndicatorDtoSchema,
} from "../../application/dto/longTermIndicator.dto";
import {
  type MidTermIndicatorDto,
  midTermIndicatorDtoSchema,
} from "../../application/dto/midTermIndicator.dto";
import {
  buildLongTermFilterConditions,
  buildMidTermFilterConditions,
} from "../utils/buildFilterConditions";
import { getFilteredStockIdsByTags } from "../utils/getFilteredStockIdsByTags";

/**
 * 中期指標の最新データを取得する関数の型定義
 */
export type GetLatestMidTermIndicators = (
  filterConditions?: FilterConditionsInputDto,
) => Promise<MidTermIndicatorDto[]>;

/**
 * 長期指標の最新データを取得する関数の型定義
 */
export type GetLatestLongTermIndicators = (
  filterConditions?: FilterConditionsInputDto,
) => Promise<LongTermIndicatorDto[]>;

/**
 * 銘柄IDからタグデータを取得
 */
const getStockTagsByStockIds = async (
  stockIds: string[],
): Promise<Map<string, { macroTagIds: string[]; themeTagIds: string[] }>> => {
  if (stockIds.length === 0) {
    return new Map();
  }

  // マクロタグとテーマタグを並列で取得
  const [macroTags, themeTags] = await Promise.all([
    db
      .select({
        stockId: stockMacroTags.stockId,
        macroTagId: stockMacroTags.macroTagId,
      })
      .from(stockMacroTags)
      .where(inArray(stockMacroTags.stockId, stockIds)),
    db
      .select({
        stockId: stockThemeTags.stockId,
        themeTagId: stockThemeTags.themeTagId,
      })
      .from(stockThemeTags)
      .where(inArray(stockThemeTags.stockId, stockIds)),
  ]);

  // stockId -> タグIDの配列にマップ
  const tagMap = new Map<string, { macroTagIds: string[]; themeTagIds: string[] }>();

  // 初期化
  for (const stockId of stockIds) {
    tagMap.set(stockId, { macroTagIds: [], themeTagIds: [] });
  }

  // マクロタグをマップに追加
  for (const tag of macroTags) {
    const entry = tagMap.get(tag.stockId);
    if (entry) {
      entry.macroTagIds.push(tag.macroTagId);
    }
  }

  // テーマタグをマップに追加
  for (const tag of themeTags) {
    const entry = tagMap.get(tag.stockId);
    if (entry) {
      entry.themeTagIds.push(tag.themeTagId);
    }
  }

  return tagMap;
};

/**
 * 中期指標の最新データを取得
 */
export const getLatestMidTermIndicators: GetLatestMidTermIndicators = async (filterConditions) => {
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

  // sector_averagesの最新日付を取得
  const latestSectorDateResult = await db
    .select({ dataDate: sectorAverages.dataDate })
    .from(sectorAverages)
    .orderBy(desc(sectorAverages.dataDate))
    .limit(1);
  const latestSectorDate = latestSectorDateResult[0]?.dataDate;

  const filteredStockIds = await getFilteredStockIdsByTags();

  if (filteredStockIds !== null && filteredStockIds.length === 0) {
    return [];
  }

  const baseCondition = eq(midTermIndicators.collectedAt, latestDate);
  const whereCondition = buildMidTermFilterConditions(
    baseCondition,
    filterConditions,
    filteredStockIds,
  );

  // 最新日付のデータを取得
  // sector_averagesは最新の業種平均データを使用（日付は一致しなくてもOK）
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
      rsiShort: midTermIndicators.rsiShort,
      priceHigh: midTermIndicators.priceHigh,
      priceLow: midTermIndicators.priceLow,
      // 出来高指標
      avgVolumeShort: midTermIndicators.avgVolumeShort,
      avgVolumeLong: midTermIndicators.avgVolumeLong,
      // sector_averagesから業種平均を取得（最新データを使用）
      sectorAvgPer: sectorAverages.avgPer,
      sectorAvgPbr: sectorAverages.avgPbr,
      // 財務健全性データ
      equityRatio: stockFinancialHealth.equityRatio,
      roe: stockFinancialHealth.roe,
      operatingIncomeDeclineYears: stockFinancialHealth.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: stockFinancialHealth.operatingCashFlowNegativeYears,
      revenueDeclineYears: stockFinancialHealth.revenueDeclineYears,
      // EPS成長率計算用（グロース市場のみ使用）
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
    .where(whereCondition);

  // タグデータを取得
  const stockIds = results.map((row) => row.stockId);
  const tagMap = await getStockTagsByStockIds(stockIds);

  // DTOに変換
  return results.map((row) => {
    const tags = tagMap.get(row.stockId) ?? { macroTagIds: [], themeTagIds: [] };
    return midTermIndicatorDtoSchema.parse({
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
      rsiShort: row.rsiShort ? Number(row.rsiShort) : null,
      priceHigh: row.priceHigh ? Number(row.priceHigh) : null,
      priceLow: row.priceLow ? Number(row.priceLow) : null,
      avgVolumeShort: row.avgVolumeShort ? Number(row.avgVolumeShort) : null,
      avgVolumeLong: row.avgVolumeLong ? Number(row.avgVolumeLong) : null,
      sectorAvgPer: row.sectorAvgPer ? Number(row.sectorAvgPer) : null,
      sectorAvgPbr: row.sectorAvgPbr ? Number(row.sectorAvgPbr) : null,
      equityRatio: row.equityRatio ? Number(row.equityRatio) : null,
      roe: row.roe ? Number(row.roe) : null,
      operatingIncomeDeclineYears: row.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: row.operatingCashFlowNegativeYears,
      revenueDeclineYears: row.revenueDeclineYears,
      epsLatest: row.epsLatest ? Number(row.epsLatest) : null,
      eps3yAgo: row.eps3yAgo ? Number(row.eps3yAgo) : null,
      macroTagIds: tags.macroTagIds,
      themeTagIds: tags.themeTagIds,
    });
  });
};

/**
 * 長期指標の最新データを取得
 */
export const getLatestLongTermIndicators: GetLatestLongTermIndicators = async (
  filterConditions,
) => {
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

  // sector_averagesの最新日付を取得
  const latestSectorDateResult = await db
    .select({ dataDate: sectorAverages.dataDate })
    .from(sectorAverages)
    .orderBy(desc(sectorAverages.dataDate))
    .limit(1);
  const latestSectorDate = latestSectorDateResult[0]?.dataDate;

  const filteredStockIds = await getFilteredStockIdsByTags();

  if (filteredStockIds !== null && filteredStockIds.length === 0) {
    return [];
  }

  const baseCondition = eq(longTermIndicators.collectedAt, latestDate);
  const whereCondition = buildLongTermFilterConditions(
    baseCondition,
    filterConditions,
    filteredStockIds,
  );

  // 最新日付のデータを取得
  // sector_averagesは最新の業種平均データを使用（日付は一致しなくてもOK）
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
      // 出来高指標（罠株除外用）
      avgVolumeShort: longTermIndicators.avgVolumeShort,
      // sector_averagesから業種平均を取得（最新データを使用）
      sectorAvgPer: sectorAverages.avgPer,
      sectorAvgPbr: sectorAverages.avgPbr,
      // 財務健全性データ
      equityRatio: stockFinancialHealth.equityRatio,
      roe: stockFinancialHealth.roe,
      operatingIncomeDeclineYears: stockFinancialHealth.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: stockFinancialHealth.operatingCashFlowNegativeYears,
      revenueDeclineYears: stockFinancialHealth.revenueDeclineYears,
      // EPS成長率計算用（長期スコアリング用）
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
    .where(whereCondition);

  // タグデータを取得
  const stockIds = results.map((row) => row.stockId);
  const tagMap = await getStockTagsByStockIds(stockIds);

  // DTOに変換
  return results.map((row) => {
    const tags = tagMap.get(row.stockId) ?? { macroTagIds: [], themeTagIds: [] };
    return longTermIndicatorDtoSchema.parse({
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
      avgVolumeShort: row.avgVolumeShort ? Number(row.avgVolumeShort) : null,
      sectorAvgPer: row.sectorAvgPer ? Number(row.sectorAvgPer) : null,
      sectorAvgPbr: row.sectorAvgPbr ? Number(row.sectorAvgPbr) : null,
      equityRatio: row.equityRatio ? Number(row.equityRatio) : null,
      roe: row.roe ? Number(row.roe) : null,
      operatingIncomeDeclineYears: row.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: row.operatingCashFlowNegativeYears,
      revenueDeclineYears: row.revenueDeclineYears,
      epsLatest: row.epsLatest ? Number(row.epsLatest) : null,
      eps3yAgo: row.eps3yAgo ? Number(row.eps3yAgo) : null,
      macroTagIds: tags.macroTagIds,
      themeTagIds: tags.themeTagIds,
    });
  });
};
