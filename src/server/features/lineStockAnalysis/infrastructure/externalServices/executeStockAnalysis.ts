/**
 * OpenAI APIを使用した銘柄分析の実行
 */

import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "@/server/lib/openai";
import {
  type StockAnalysisResultDto,
  stockAnalysisResultDtoSchema,
} from "../../application/dto/stockAnalysisResult.dto";

/**
 * 分析実行パラメータの型定義
 */
type ExecuteStockAnalysisParams = Readonly<{
  instructions: string;
  input: string;
}>;

/**
 * 分析実行結果の型定義
 */
export type ExecuteStockAnalysisResult =
  | Readonly<{
      success: true;
      analysisResult: StockAnalysisResultDto;
      rawResponse: string;
    }>
  | Readonly<{
      success: false;
      error: string;
    }>;

/**
 * OpenAI APIで銘柄分析を実行する関数の型定義
 */
export type ExecuteStockAnalysis = (
  params: ExecuteStockAnalysisParams,
) => Promise<ExecuteStockAnalysisResult>;

/**
 * OpenAI Responses APIで銘柄分析を実行し、パース済みの結果を返す
 */
export const executeStockAnalysis: ExecuteStockAnalysis = async ({ instructions, input }) => {
  try {
    // Zodスキーマ → JSONスキーマ変換
    const responseFormat = zodResponseFormat(stockAnalysisResultDtoSchema, "stock_analysis");

    // OpenAI Responses APIで分析実行（構造化出力を指定）
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions,
      input,
      text: {
        format: {
          type: "json_schema",
          name: responseFormat.json_schema.name,
          schema: responseFormat.json_schema.schema as Record<string, unknown>,
          strict: responseFormat.json_schema.strict ?? true,
        },
      },
      tools: [{ type: "web_search_preview" }],
    });

    const rawResponse = response.output_text ?? "";

    if (!rawResponse) {
      return {
        success: false,
        error: "AIからの応答がありませんでした。",
      };
    }

    // ウェブ検索の引用マーカーを削除
    const cleanedResponse = rawResponse
      .replace(/(cite)?turn\d+(news|search)\d+/gi, "")
      .replace(/\bcite\b/gi, "")
      .trim();

    // JSONをパースしてZodでバリデーション
    const parsed = JSON.parse(cleanedResponse);
    const analysisResult = stockAnalysisResultDtoSchema.parse(parsed);

    return {
      success: true,
      analysisResult,
      rawResponse,
    };
  } catch (error) {
    console.error("[executeStockAnalysis] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "分析中にエラーが発生しました。",
    };
  }
};
