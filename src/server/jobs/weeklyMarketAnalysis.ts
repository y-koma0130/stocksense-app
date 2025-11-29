/**
 * 中期マーケット分析ジョブ
 * 毎週土曜日2:00 (JST)に実行
 * LLMを使用して1-6ヶ月の投資目線でマーケット分析を実施
 */

import { zodResponseFormat } from "openai/helpers/zod";
import { DEFAULT_MODEL, openai } from "@/server/lib/openai";
import { inngest } from "../../../inngest/client";
import { MarketAnalysisResultSchema } from "../features/marketAnalysis/domain/values/types";
import { saveMarketAnalysis } from "../features/marketAnalysis/infrastructure/repositories/saveMarketAnalysis";
import { buildMarketAnalysisPrompt } from "./utils/buildMarketAnalysisPrompt";

export const weeklyMarketAnalysis = inngest.createFunction(
  {
    id: "weekly-market-analysis",
    name: "Weekly Market Analysis (Mid-Term)",
    retries: 2,
  },
  { cron: "TZ=Asia/Tokyo 0 2 * * 6" }, // 毎週土曜日2:00 JST
  async ({ step }) => {
    // プロンプト生成
    const prompt = buildMarketAnalysisPrompt({ periodType: "mid_term" });

    // Zodスキーマ → JSONスキーマ変換（OpenAIヘルパーを使用）
    const responseFormat = zodResponseFormat(MarketAnalysisResultSchema, "market_analysis");
    const jsonSchema = responseFormat.json_schema.schema;

    // OpenAI Responses APIをバインド
    const createResponse = openai.responses.create.bind(openai.responses);

    const responseParams = {
      model: DEFAULT_MODEL,
      instructions:
        "あなたは日本株のバリュー投資を専門とするプロのアナリストです。最新のマーケット情報をウェブ検索して、指定された構造で正確に分析結果を出力してください。",
      input: prompt,
      text: {
        format: {
          type: "json_schema" as const,
          name: "market_analysis",
          schema: jsonSchema,
        },
      },
      tools: [{ type: "web_search_preview" as const }],
    };

    // step.ai.wrapでLLM呼び出し
    const response = (await step.ai.wrap(
      "analyze-mid-term-market",
      createResponse,
      responseParams as never,
    )) as { output_text: string };

    const rawResponse = response.output_text ?? "";

    if (!rawResponse) {
      throw new Error("LLM returned empty response");
    }

    // ウェブ検索の引用マーカー（citeturn0news12, turn0search1, cite等）を削除
    const cleanedResponse = rawResponse
      .replace(/(cite)?turn\d+(news|search)\d+/gi, "")
      .replace(/\bcite\b/gi, "")
      .trim();

    // JSONをパースしてバリデーション
    const parsed = JSON.parse(cleanedResponse);
    const result = MarketAnalysisResultSchema.parse(parsed);

    // データベースに保存
    await step.run("save-analysis-result", async () => {
      await saveMarketAnalysis({ result, rawResponse });
    });

    return {
      message: "Weekly market analysis completed",
      periodType: "mid_term",
    };
  },
);
