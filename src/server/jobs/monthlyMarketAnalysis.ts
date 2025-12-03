/**
 * 長期マーケット分析ジョブ
 * 毎月1日2:00 (JST)に実行
 * LLMを使用して6ヶ月-3年の投資目線でマーケット分析を実施
 * 有望マクロタグ・テーマタグの選定も行う
 */

import { zodResponseFormat } from "openai/helpers/zod";
import { DEFAULT_MODEL, openai } from "@/server/lib/openai";
import { inngest } from "../../../inngest/client";
import { LongTermMarketAnalysisResultSchema } from "../features/marketAnalysis/domain/values/types";
import { saveMarketAnalysis } from "../features/marketAnalysis/infrastructure/repositories/saveMarketAnalysis";
import { buildLongTermMarketAnalysisPrompt } from "./utils/buildLongTermMarketAnalysisPrompt";

export const monthlyMarketAnalysis = inngest.createFunction(
  {
    id: "monthly-market-analysis",
    name: "Monthly Market Analysis (Long-Term)",
    retries: 2,
  },
  { cron: "TZ=Asia/Tokyo 0 2 1 * *" }, // 毎月1日2:00 JST
  async ({ step }) => {
    // 長期分析用プロンプト生成
    const { context, instruction } = buildLongTermMarketAnalysisPrompt();

    // Zodスキーマ → JSONスキーマ変換（長期分析用スキーマを使用）
    const responseFormat = zodResponseFormat(LongTermMarketAnalysisResultSchema, "market_analysis");
    const jsonSchema = responseFormat.json_schema.schema;

    // OpenAI Responses APIをバインド
    const createResponse = openai.responses.create.bind(openai.responses);

    const responseParams = {
      model: DEFAULT_MODEL,
      instructions:
        "あなたは日本株のバリュー投資を専門とするプロのアナリストです。最新のマーケット情報をウェブ検索して、指定された構造で正確に分析結果を出力してください。",
      input: [
        { role: "developer" as const, content: context },
        { role: "user" as const, content: instruction },
      ],
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
      "analyze-long-term-market",
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

    // JSONをパースしてバリデーション（長期分析用スキーマで検証）
    const parsed = JSON.parse(cleanedResponse);
    const result = LongTermMarketAnalysisResultSchema.parse(parsed);

    // データベースに保存
    await step.run("save-analysis-result", async () => {
      await saveMarketAnalysis({ result, rawResponse });
    });

    return {
      message: "Monthly market analysis completed",
      periodType: "long_term",
      favorableMacroTags: result.favorableMacroTags,
      favorableThemeTags: result.favorableThemeTags,
      unfavorableMacroTags: result.unfavorableMacroTags,
      unfavorableThemeTags: result.unfavorableThemeTags,
    };
  },
);
