/**
 * 銘柄分析結果をDBに保存するリポジトリ
 */

import { db } from "@/db";
import { stockAnalyses } from "@/db/schema";
import type { StockAnalysisEntity } from "../../domain/entities/stockAnalysis.entity";

/**
 * 銘柄分析結果を保存する関数の型定義
 */
export type SaveStockAnalysis = (entity: StockAnalysisEntity) => Promise<void>;

/**
 * 銘柄分析結果をDBに保存
 */
export const saveStockAnalysis: SaveStockAnalysis = async (entity) => {
  await db.insert(stockAnalyses).values({
    stockId: entity.stockId,
    periodType: entity.periodType,
    analyzedAt: entity.analyzedAt,
    valueStockRating: entity.valueStockRating,
    summary: entity.summary,
    investmentPoints: entity.investmentPoints,
    risks: entity.risks,
    llmRawResponse: entity.llmRawResponse,
  });
};
