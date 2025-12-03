/**
 * マーケット分析のDTO（Data Transfer Object）
 */

import type { MacroTagId } from "@/assets/macroTags";
import type { ThemeTagId } from "@/assets/themeTags";
import type { PeriodType, SectorInfo, ThemeInfo } from "../../domain/values/types";

/**
 * マーケット分析DTO
 */
export type MarketAnalysisDto = Readonly<{
  id: string;
  periodType: PeriodType;
  analyzedAt: Date;
  interestRateTrend: string;
  favorableSectors: SectorInfo[];
  unfavorableSectors: SectorInfo[];
  favorableThemes: ThemeInfo[];
  unfavorableThemes: ThemeInfo[];
  favorableMacroTags: MacroTagId[] | null;
  favorableThemeTags: ThemeTagId[] | null;
  economicSummary: string;
}>;
