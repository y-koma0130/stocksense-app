/**
 * 個別株分析結果をDBに保存
 */

import { db } from "@/db";
import { stockAnalyses } from "@/db/schema";
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
    analyzedAt: new Date(),
    valueStockRating: result.valueStockRating,
    rationale: result.rationale,
    strengths: result.strengths,
    risks: result.risks,
    financialAnalysis: result.financialAnalysis,
    sectorPosition: result.sectorPosition,
    llmRawResponse: rawResponse,
  });
};
