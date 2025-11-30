/**
 * LINE銘柄分析ユースケース
 * 特定銘柄のバリュー投資分析を実行
 */

import type { PeriodType } from "@/constants/periodTypes";
import type { GetLatestMarketAnalysis } from "@/server/features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import { createStockAnalysisEntity } from "../../domain/entities/stockAnalysis.entity";
import { buildLongTermAnalysisPrompt } from "../../domain/services/buildLongTermAnalysisPrompt";
import { buildMidTermAnalysisPrompt } from "../../domain/services/buildMidTermAnalysisPrompt";
import type { ExecuteStockAnalysis } from "../../infrastructure/externalServices/executeStockAnalysis";
import type { GetLongTermStockIndicatorByStockId } from "../../infrastructure/queryServices/getLongTermStockIndicatorByStockId";
import type { GetMidTermStockIndicatorByStockId } from "../../infrastructure/queryServices/getMidTermStockIndicatorByStockId";
import type { SaveStockAnalysis } from "../../infrastructure/repositories/saveStockAnalysis";
import {
  type AnalyzeStockForLineResultDto,
  analyzeStockForLineResultDtoSchema,
} from "../dto/analyzeStockForLineResult.dto";

/**
 * 依存関係の型定義
 */
type Dependencies = Readonly<{
  getMidTermStockIndicatorByStockId: GetMidTermStockIndicatorByStockId;
  getLongTermStockIndicatorByStockId: GetLongTermStockIndicatorByStockId;
  getLatestMarketAnalysis: GetLatestMarketAnalysis;
  executeStockAnalysis: ExecuteStockAnalysis;
  saveStockAnalysis: SaveStockAnalysis;
}>;

/**
 * パラメータの型定義
 */
type Params = Readonly<{
  stockId: string;
  tickerCode: string;
  periodType: PeriodType;
}>;

/**
 * LINE銘柄分析ユースケースの型定義
 */
export type AnalyzeStockForLineUsecase = (
  dependencies: Dependencies,
  params: Params,
) => Promise<AnalyzeStockForLineResultDto>;

/**
 * 特定銘柄のバリュー投資分析を実行
 * 指定された期間タイプで分析を実行
 */
export const analyzeStockForLineUsecase: AnalyzeStockForLineUsecase = async (
  dependencies,
  params,
) => {
  const {
    getMidTermStockIndicatorByStockId,
    getLongTermStockIndicatorByStockId,
    getLatestMarketAnalysis,
    executeStockAnalysis,
    saveStockAnalysis,
  } = dependencies;
  const { stockId, tickerCode, periodType } = params;

  try {
    // 期間タイプに応じた指標データを取得し、プロンプトを生成
    let instructions: string;
    let input: string;
    let stockTickerCode: string;
    let stockName: string;

    // マーケット分析を取得
    const marketAnalysis = await getLatestMarketAnalysis({ periodType });

    if (periodType === "mid_term") {
      const midTermIndicator = await getMidTermStockIndicatorByStockId(stockId);
      if (!midTermIndicator) {
        return analyzeStockForLineResultDtoSchema.parse({
          success: false,
          error: `銘柄 ${tickerCode} の中期指標データが見つかりませんでした。`,
        });
      }
      stockTickerCode = midTermIndicator.tickerCode;
      stockName = midTermIndicator.name;

      const prompt = buildMidTermAnalysisPrompt({
        stockData: midTermIndicator,
        marketAnalysis,
      });
      instructions = prompt.instructions;
      input = prompt.input;
    } else {
      const longTermIndicator = await getLongTermStockIndicatorByStockId(stockId);
      if (!longTermIndicator) {
        return analyzeStockForLineResultDtoSchema.parse({
          success: false,
          error: `銘柄 ${tickerCode} の長期指標データが見つかりませんでした。`,
        });
      }
      stockTickerCode = longTermIndicator.tickerCode;
      stockName = longTermIndicator.name;

      const prompt = buildLongTermAnalysisPrompt({
        stockData: longTermIndicator,
        marketAnalysis,
      });
      instructions = prompt.instructions;
      input = prompt.input;
    }

    // OpenAI APIで分析実行
    const analysisResponse = await executeStockAnalysis({ instructions, input });

    if (!analysisResponse.success) {
      return analyzeStockForLineResultDtoSchema.parse({
        success: false,
        error: analysisResponse.error,
      });
    }

    const { analysisResult, rawResponse } = analysisResponse;

    // 集約エンティティを生成
    const stockAnalysisEntity = createStockAnalysisEntity({
      stockId,
      periodType,
      valueStockRating: analysisResult.valueStockRating,
      summary: analysisResult.summary,
      investmentPoints: analysisResult.investmentPoints,
      risks: analysisResult.risks,
      llmRawResponse: rawResponse,
    });

    // データベースに保存
    await saveStockAnalysis(stockAnalysisEntity);

    return analyzeStockForLineResultDtoSchema.parse({
      success: true,
      tickerCode: stockTickerCode,
      stockName: stockName,
      valueStockRating: analysisResult.valueStockRating,
      summary: analysisResult.summary,
      investmentPoints: analysisResult.investmentPoints,
      risks: analysisResult.risks,
    });
  } catch (error) {
    console.error("[analyzeStockForLineUsecase] Error:", error);
    return analyzeStockForLineResultDtoSchema.parse({
      success: false,
      error: error instanceof Error ? error.message : "分析中にエラーが発生しました。",
    });
  }
};
