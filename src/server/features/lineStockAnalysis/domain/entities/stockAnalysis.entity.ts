/**
 * 銘柄分析結果の集約エンティティ
 */

import { z } from "zod";
import type { PeriodType } from "@/constants/periodTypes";
import { VALUE_STOCK_RATINGS } from "@/constants/valueStockRatings";
import { nowJST } from "@/lib/datetime/jst";

/**
 * バリュー株評価スキーマ
 */
const valueStockRatingSchema = z.enum([
  VALUE_STOCK_RATINGS.EXCELLENT,
  VALUE_STOCK_RATINGS.GOOD,
  VALUE_STOCK_RATINGS.FAIR,
  VALUE_STOCK_RATINGS.POOR,
  VALUE_STOCK_RATINGS.VERY_POOR,
]);

/**
 * 銘柄分析エンティティスキーマ
 */
export const stockAnalysisEntitySchema = z.object({
  stockId: z.uuid(),
  periodType: z.enum(["mid_term", "long_term"]) as z.ZodType<PeriodType>,
  analyzedAt: z.date(),
  valueStockRating: valueStockRatingSchema,
  summary: z.string().min(50).max(300),
  investmentPoints: z.array(z.string().max(80)).min(3).max(4),
  risks: z.array(z.string().max(80)).min(2).max(3),
  llmRawResponse: z.string(),
});

/**
 * 銘柄分析エンティティ型
 */
export type StockAnalysisEntity = z.infer<typeof stockAnalysisEntitySchema>;

/**
 * 銘柄分析エンティティ生成パラメータ
 */
type CreateStockAnalysisEntityParams = Readonly<{
  stockId: string;
  periodType: PeriodType;
  valueStockRating: string;
  summary: string;
  investmentPoints: string[];
  risks: string[];
  llmRawResponse: string;
}>;

/**
 * 銘柄分析エンティティを生成
 * バリデーション済みのエンティティを返す
 */
export const createStockAnalysisEntity = (
  params: CreateStockAnalysisEntityParams,
): StockAnalysisEntity => {
  return stockAnalysisEntitySchema.parse({
    stockId: params.stockId,
    periodType: params.periodType,
    analyzedAt: nowJST(),
    valueStockRating: params.valueStockRating,
    summary: params.summary,
    investmentPoints: params.investmentPoints,
    risks: params.risks,
    llmRawResponse: params.llmRawResponse,
  });
};
