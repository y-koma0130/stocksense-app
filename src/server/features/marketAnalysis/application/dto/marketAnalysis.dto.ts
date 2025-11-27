/**
 * マーケット分析のDTO（Data Transfer Object）
 */

import type { SectorInfo, ThemeInfo, PeriodType } from "../../domain/values/types";

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
  economicSummary: string;
}>;
