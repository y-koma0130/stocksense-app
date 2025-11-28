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

  // 総合評価コメント（最大300字厳守）- 割安度の根拠と投資判断の視点
  summary: z.string().min(50).max(300),

  // 投資する場合の魅力ポイント（3-4項目、各80字以内厳守）
  investmentPoints: z.array(z.string().max(80)).min(3).max(4),

  // 注意すべきリスク（2-3項目、各80字以内厳守）
  risks: z.array(z.string().max(80)).min(2).max(3),
});

export type StockAnalysisResult = z.infer<typeof StockAnalysisResultSchema>;
