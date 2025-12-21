/**
 * 個別株分析のDTO
 */

import { z } from "zod";
import { ValueStockRatingSchema } from "../../domain/values/types";

/**
 * 個別株分析DTOスキーマ
 */
export const StockAnalysisDtoSchema = z.object({
  id: z.string().uuid(),
  stockId: z.string().uuid(),
  periodType: z.string(),
  analyzedAt: z.date(),
  valueStockRating: ValueStockRatingSchema.nullable(),
  summary: z.string().nullable(),
  summaryShort: z.string().nullable(),
  investmentPoints: z.array(z.string()),
  risks: z.array(z.string()),
});

export type StockAnalysisDto = z.infer<typeof StockAnalysisDtoSchema>;

/**
 * DBレコードをDTOに変換（Zodでパース）
 */
export const toStockAnalysisDto = (record: {
  id: string;
  stockId: string;
  periodType: string;
  analyzedAt: Date;
  valueStockRating: string | null;
  summary: string | null;
  summaryShort: string | null;
  investmentPoints: unknown;
  risks: unknown;
}): StockAnalysisDto => {
  return StockAnalysisDtoSchema.parse({
    id: record.id,
    stockId: record.stockId,
    periodType: record.periodType,
    analyzedAt: record.analyzedAt,
    valueStockRating: record.valueStockRating,
    summary: record.summary,
    summaryShort: record.summaryShort,
    investmentPoints: Array.isArray(record.investmentPoints) ? record.investmentPoints : [],
    risks: Array.isArray(record.risks) ? record.risks : [],
  });
};
