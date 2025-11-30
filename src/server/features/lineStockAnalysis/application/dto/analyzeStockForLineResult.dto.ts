/**
 * LINE銘柄分析ユースケース結果DTO
 */

import { z } from "zod";
import { valueStockRatingSchema } from "./stockAnalysisResult.dto";

/**
 * 分析成功時の結果DTOスキーマ
 */
export const analyzeStockForLineSuccessDtoSchema = z.object({
  success: z.literal(true),
  tickerCode: z.string(),
  stockName: z.string(),
  valueStockRating: valueStockRatingSchema,
  summary: z.string(),
  investmentPoints: z.array(z.string()),
  risks: z.array(z.string()),
});

/**
 * 分析失敗時の結果DTOスキーマ
 */
export const analyzeStockForLineFailureDtoSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

/**
 * 分析結果DTOスキーマ（成功・失敗の判別共用体）
 */
export const analyzeStockForLineResultDtoSchema = z.discriminatedUnion("success", [
  analyzeStockForLineSuccessDtoSchema,
  analyzeStockForLineFailureDtoSchema,
]);

/**
 * 分析結果DTO型
 */
export type AnalyzeStockForLineResultDto = z.infer<typeof analyzeStockForLineResultDtoSchema>;
