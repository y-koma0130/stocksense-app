import { and, gte, inArray, lte, type SQL } from "drizzle-orm";
import { longTermIndicators, midTermIndicators, stocks } from "@/db/schema";
import type { FilterConditionsInputDto } from "../../application/dto/filterConditionsInput.dto";

/**
 * 中期指標用のフィルタ条件を構築する関数の型定義
 */
export type BuildMidTermFilterConditions = (
  baseCondition: SQL,
  filterConditions?: FilterConditionsInputDto,
  filteredStockIds?: string[] | null,
) => SQL;

/**
 * 長期指標用のフィルタ条件を構築する関数の型定義
 */
export type BuildLongTermFilterConditions = (
  baseCondition: SQL,
  filterConditions?: FilterConditionsInputDto,
  filteredStockIds?: string[] | null,
) => SQL;

/**
 * 中期指標用のフィルタ条件を構築
 */
export const buildMidTermFilterConditions: BuildMidTermFilterConditions = (
  baseCondition,
  filterConditions,
  filteredStockIds,
) => {
  const conditions: SQL[] = [baseCondition];

  if (filterConditions?.sectorCodes?.length) {
    conditions.push(inArray(stocks.sectorCode, filterConditions.sectorCodes));
  }

  if (filterConditions?.markets?.length) {
    conditions.push(inArray(stocks.market, filterConditions.markets));
  }

  if (filterConditions?.priceRange?.min != null) {
    conditions.push(gte(midTermIndicators.currentPrice, String(filterConditions.priceRange.min)));
  }

  if (filterConditions?.priceRange?.max != null) {
    conditions.push(lte(midTermIndicators.currentPrice, String(filterConditions.priceRange.max)));
  }

  if (filteredStockIds?.length) {
    conditions.push(inArray(midTermIndicators.stockId, filteredStockIds));
  }

  return and(...conditions)!;
};

/**
 * 長期指標用のフィルタ条件を構築
 */
export const buildLongTermFilterConditions: BuildLongTermFilterConditions = (
  baseCondition,
  filterConditions,
  filteredStockIds,
) => {
  const conditions: SQL[] = [baseCondition];

  if (filterConditions?.sectorCodes?.length) {
    conditions.push(inArray(stocks.sectorCode, filterConditions.sectorCodes));
  }

  if (filterConditions?.markets?.length) {
    conditions.push(inArray(stocks.market, filterConditions.markets));
  }

  if (filterConditions?.priceRange?.min != null) {
    conditions.push(gte(longTermIndicators.currentPrice, String(filterConditions.priceRange.min)));
  }

  if (filterConditions?.priceRange?.max != null) {
    conditions.push(lte(longTermIndicators.currentPrice, String(filterConditions.priceRange.max)));
  }

  if (filteredStockIds?.length) {
    conditions.push(inArray(longTermIndicators.stockId, filteredStockIds));
  }

  return and(...conditions)!;
};
