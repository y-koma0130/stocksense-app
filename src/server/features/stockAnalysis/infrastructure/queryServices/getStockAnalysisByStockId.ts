/**
 * stockIdで個別株分析を取得
 */

import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { stockAnalyses } from "@/db/schema";
import type { PeriodType } from "../../../marketAnalysis/domain/values/types";

type GetStockAnalysisByStockIdParams = Readonly<{
  stockId: string;
  periodType: PeriodType;
}>;

export type GetStockAnalysisByStockId = (
  params: GetStockAnalysisByStockIdParams,
) => Promise<{
  id: string;
  stockId: string;
  periodType: string;
  analyzedAt: Date;
  valueStockRating: string | null;
  summary: string | null;
  investmentPoints: unknown;
  risks: unknown;
} | null>;

export const getStockAnalysisByStockId: GetStockAnalysisByStockId = async ({
  stockId,
  periodType,
}) => {
  const results = await db
    .select()
    .from(stockAnalyses)
    .where(and(eq(stockAnalyses.stockId, stockId), eq(stockAnalyses.periodType, periodType)))
    .orderBy(desc(stockAnalyses.analyzedAt))
    .limit(1);

  return results[0] ?? null;
};
