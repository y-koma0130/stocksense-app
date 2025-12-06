/**
 * 最新のマーケット分析データを取得
 */

import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { marketAnalysis } from "@/db/schema";
import type { MarketAnalysisDto } from "../../application/dto/marketAnalysis.dto";
import type { PeriodType } from "../../domain/values/types";
import {
  MacroTagIdSchema,
  SectorInfoSchema,
  ThemeInfoSchema,
  ThemeTagIdSchema,
} from "../../domain/values/types";

const MarketAnalysisDtoSchema: z.ZodType<MarketAnalysisDto> = z.object({
  id: z.string(),
  periodType: z.enum(["mid_term", "long_term"]),
  analyzedAt: z.date(),
  interestRateTrend: z.string(),
  favorableSectors: z.array(SectorInfoSchema),
  unfavorableSectors: z.array(SectorInfoSchema),
  favorableThemes: z.array(ThemeInfoSchema),
  unfavorableThemes: z.array(ThemeInfoSchema),
  favorableMacroTags: z.array(MacroTagIdSchema).nullable(),
  favorableThemeTags: z.array(ThemeTagIdSchema).nullable(),
  unfavorableMacroTags: z.array(MacroTagIdSchema).nullable(),
  unfavorableThemeTags: z.array(ThemeTagIdSchema).nullable(),
  economicSummary: z.string(),
});

type GetLatestMarketAnalysisParams = Readonly<{
  periodType: PeriodType;
}>;

/**
 * 指定された期間タイプの最新のマーケット分析を取得
 */
export type GetLatestMarketAnalysis = (
  params: GetLatestMarketAnalysisParams,
) => Promise<MarketAnalysisDto | null>;

export const getLatestMarketAnalysis: GetLatestMarketAnalysis = async ({ periodType }) => {
  const result = await db
    .select()
    .from(marketAnalysis)
    .where(eq(marketAnalysis.periodType, periodType))
    .orderBy(desc(marketAnalysis.analyzedAt))
    .limit(1);

  const entity = result[0];
  if (!entity) return null;

  const dto = MarketAnalysisDtoSchema.parse({
    id: entity.id,
    periodType: entity.periodType,
    analyzedAt: entity.analyzedAt,
    interestRateTrend: entity.interestRateTrend,
    favorableSectors: entity.favorableSectors,
    unfavorableSectors: entity.unfavorableSectors,
    favorableThemes: entity.favorableThemes,
    unfavorableThemes: entity.unfavorableThemes,
    favorableMacroTags: entity.favorableMacroTags,
    favorableThemeTags: entity.favorableThemeTags,
    unfavorableMacroTags: entity.unfavorableMacroTags,
    unfavorableThemeTags: entity.unfavorableThemeTags,
    economicSummary: entity.economicSummary,
  });

  return dto;
};
