/**
 * 複数のstockIdで個別株分析を一括取得
 */

import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { stockAnalyses } from "@/db/schema";
import type { PeriodType } from "../../../marketAnalysis/domain/values/types";
import type { StockAnalysisDto } from "../../application/dto/stockAnalysis.dto";
import { toStockAnalysisDto } from "../../application/dto/stockAnalysis.dto";

type GetStockAnalysesByStockIdsParams = Readonly<{
  stockIds: readonly string[];
  periodType: PeriodType;
}>;

export type GetStockAnalysesByStockIds = (
  params: GetStockAnalysesByStockIdsParams,
) => Promise<Map<string, StockAnalysisDto>>;

/**
 * 複数銘柄の最新の個別株分析を一括取得
 * stockIdをキーとするMapで返却
 */
export const getStockAnalysesByStockIds: GetStockAnalysesByStockIds = async ({
  stockIds,
  periodType,
}) => {
  if (stockIds.length === 0) {
    return new Map();
  }

  // 各stockIdの最新レコードを取得
  const results = await db
    .select()
    .from(stockAnalyses)
    .where(
      and(inArray(stockAnalyses.stockId, [...stockIds]), eq(stockAnalyses.periodType, periodType)),
    )
    .orderBy(desc(stockAnalyses.analyzedAt));

  // stockId毎に最新のレコードのみをMapに格納
  const analysisMap = new Map<string, StockAnalysisDto>();
  for (const record of results) {
    if (!analysisMap.has(record.stockId)) {
      analysisMap.set(record.stockId, toStockAnalysisDto(record));
    }
  }

  return analysisMap;
};
