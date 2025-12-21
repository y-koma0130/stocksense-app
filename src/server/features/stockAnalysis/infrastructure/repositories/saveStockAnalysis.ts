/**
 * 個別株分析結果をDBに保存
 */

import { db } from "@/db";
import { stockAnalyses } from "@/db/schema";
import { nowJST } from "@/lib/datetime/jst";
import type { PeriodType } from "../../../marketAnalysis/domain/values/types";
import type { StockAnalysisResult } from "../../domain/values/types";

type SaveStockAnalysisParams = Readonly<{
  stockId: string;
  periodType: PeriodType;
  result: StockAnalysisResult;
  rawResponse: string;
}>;

export type SaveStockAnalysis = (params: SaveStockAnalysisParams) => Promise<void>;

export const saveStockAnalysis: SaveStockAnalysis = async ({
  stockId,
  periodType,
  result,
  rawResponse,
}) => {
  await db.insert(stockAnalyses).values({
    stockId,
    periodType,
    analyzedAt: nowJST(),
    valueStockRating: result.valueStockRating,
    summary: result.summary,
    summaryShort: result.summaryShort ?? null,
    investmentPoints: result.investmentPoints,
    risks: result.risks,
    llmRawResponse: rawResponse,
  });
};
