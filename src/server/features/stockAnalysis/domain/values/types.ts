/**
 * 個別株分析の値オブジェクト型定義
 */

import { z } from "zod";
import { VALUE_STOCK_RATINGS } from "@/constants/valueStockRatings";

/**
 * バリュー株としての評価（5段階）
 * 既に内部スコアリングにより上位に抽出された銘柄の相対評価
 */
export const ValueStockRatingSchema = z.enum([
  VALUE_STOCK_RATINGS.EXCELLENT,
  VALUE_STOCK_RATINGS.GOOD,
  VALUE_STOCK_RATINGS.FAIR,
  VALUE_STOCK_RATINGS.POOR,
  VALUE_STOCK_RATINGS.VERY_POOR,
]);
export type ValueStockRating = z.infer<typeof ValueStockRatingSchema>;

/**
 * 個別株分析結果スキーマ
 */
export const StockAnalysisResultSchema = z.object({
  // バリュー株としての評価（5段階）
  valueStockRating: ValueStockRatingSchema,

  // 評価理由・総合評価（200字以内）
  rationale: z.string().max(200),

  // 強み・魅力ポイント（3-5項目、各80字以内）
  strengths: z.array(z.string().max(80)).min(3).max(5),

  // リスク・懸念点（2-3項目、各80字以内）
  risks: z.array(z.string().max(80)).min(2).max(3),

  // 財務分析コメント（150字以内）
  financialAnalysis: z.string().max(150),

  // セクター内位置づけ（100字以内）
  sectorPosition: z.string().max(100),
});

export type StockAnalysisResult = z.infer<typeof StockAnalysisResultSchema>;
