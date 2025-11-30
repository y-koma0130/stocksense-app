/**
 * LINE銘柄分析結果DTO
 * externalServicesから返却される分析結果の型定義
 */

import { z } from "zod";
import { VALUE_STOCK_RATINGS } from "@/constants/valueStockRatings";

/**
 * バリュー株としての評価（5段階）
 */
export const valueStockRatingSchema = z.enum([
  VALUE_STOCK_RATINGS.EXCELLENT,
  VALUE_STOCK_RATINGS.GOOD,
  VALUE_STOCK_RATINGS.FAIR,
  VALUE_STOCK_RATINGS.POOR,
  VALUE_STOCK_RATINGS.VERY_POOR,
]);

/**
 * 銘柄分析結果DTOスキーマ
 */
export const stockAnalysisResultDtoSchema = z.object({
  // バリュー株としての評価（5段階）
  valueStockRating: valueStockRatingSchema,

  // 総合評価コメント（最大300字厳守）- 割安度の根拠と投資判断の視点
  summary: z.string().min(50).max(300),

  // 投資する場合の魅力ポイント（3-4項目、各80字以内厳守）
  investmentPoints: z.array(z.string().max(80)).min(3).max(4),

  // 注意すべきリスク（2-3項目、各80字以内厳守）
  risks: z.array(z.string().max(80)).min(2).max(3),
});

/**
 * 銘柄分析結果DTO型
 */
export type StockAnalysisResultDto = z.infer<typeof stockAnalysisResultDtoSchema>;
