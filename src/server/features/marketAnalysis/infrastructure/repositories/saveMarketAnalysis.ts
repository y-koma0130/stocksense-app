/**
 * マーケット分析結果の保存
 */

import { db } from "@/db";
import { marketAnalysis } from "@/db/schema";
import type { MarketAnalysisResult } from "../../domain/values/types";

type SaveMarketAnalysisParams = Readonly<{
  result: MarketAnalysisResult;
  rawResponse: string;
}>;

/**
 * マーケット分析結果をデータベースに保存
 */
export type SaveMarketAnalysis = (params: SaveMarketAnalysisParams) => Promise<void>;

export const saveMarketAnalysis: SaveMarketAnalysis = async ({ result, rawResponse }) => {
  await db.insert(marketAnalysis).values({
    periodType: result.periodType,
    analyzedAt: new Date(),
    interestRateTrend: result.interestRateTrend,
    favorableSectors: result.favorableSectors,
    unfavorableSectors: result.unfavorableSectors,
    favorableThemes: result.favorableThemes,
    unfavorableThemes: result.unfavorableThemes,
    economicSummary: result.economicSummary,
    llmRawResponse: rawResponse,
  });
};
