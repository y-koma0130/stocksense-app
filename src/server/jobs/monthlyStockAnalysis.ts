/**
 * 月次個別株分析ジョブ
 * 毎月1日4:00 (JST)に実行（マーケット分析・指標取得の後）
 * 上位N銘柄の個別分析を実施（長期目線）
 */

import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "@/server/lib/openai";
import { inngest } from "../../../inngest/client";
import { getLatestMarketAnalysis } from "../features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import { StockAnalysisResultSchema } from "../features/stockAnalysis/domain/values/types";
import { saveStockAnalysis } from "../features/stockAnalysis/infrastructure/repositories/saveStockAnalysis";
import { getTopValueStocks } from "../features/valueStockScoring/infrastructure/queryServices/getTopValueStocks";
import { buildStockAnalysisPrompt } from "./utils/buildStockAnalysisPrompt";

// 分析対象銘柄数（固定）
const ANALYSIS_COUNT = 5;

export const monthlyStockAnalysis = inngest.createFunction(
  {
    id: "monthly-stock-analysis",
    name: "Monthly Stock Analysis (Long-Term)",
    retries: 2,
  },
  { cron: "TZ=Asia/Tokyo 0 4 1 * *" }, // 毎月1日4:00 JST
  async ({ step }) => {
    // 最新のマーケット分析を取得
    const marketAnalysis = await step.run("fetch-market-analysis", async () => {
      return await getLatestMarketAnalysis({ periodType: "long_term" });
    });

    // 上位N銘柄を取得
    const topStocks = await step.run("fetch-top-stocks", async () => {
      return await getTopValueStocks({ periodType: "long_term", limit: ANALYSIS_COUNT });
    });

    if (topStocks.length === 0) {
      throw new Error("No stocks found for analysis");
    }

    // 各銘柄を順次分析
    const results = [];
    for (const stock of topStocks) {
      // プロンプト生成（構造化データはinputに含まれる）
      const { instructions, input } = buildStockAnalysisPrompt({
        periodType: "long_term",
        stockData: {
          tickerCode: stock.tickerCode,
          name: stock.name,
          sectorName: stock.sectorName,
          market: stock.market,
          currentPrice: stock.currentPrice,
          per: stock.per,
          pbr: stock.pbr,
          rsi: stock.rsi,
          priceHigh: stock.priceHigh,
          priceLow: stock.priceLow,
          sectorAvgPer: stock.sectorAvgPer,
          sectorAvgPbr: stock.sectorAvgPbr,
        },
        marketAnalysis,
      });

      // Zodスキーマ → JSONスキーマ変換
      const responseFormat = zodResponseFormat(StockAnalysisResultSchema, "stock_analysis");
      const jsonSchema = responseFormat.json_schema.schema;

      // OpenAI Responses APIをバインド
      const createResponse = openai.responses.create.bind(openai.responses);

      const responseParams = {
        model: "gpt-4o-mini" as const,
        instructions,
        input,
        text: {
          format: {
            type: "json_schema" as const,
            name: "stock_analysis",
            schema: jsonSchema,
          },
        },
        tools: [{ type: "web_search_preview" as const }],
      };

      // step.ai.wrapでLLM呼び出し
      const response = (await step.ai.wrap(
        `llm-analyze-${stock.tickerCode}`,
        createResponse,
        responseParams as never,
      )) as { output_text: string };

      // パース・保存処理
      const result = await step.run(`process-${stock.tickerCode}`, async () => {
        const rawResponse = response.output_text ?? "";

        if (!rawResponse) {
          throw new Error(`LLM returned empty response for ${stock.tickerCode}`);
        }

        // ウェブ検索の引用マーカーを削除
        const cleanedResponse = rawResponse
          .replace(/(cite)?turn\d+(news|search)\d+/gi, "")
          .replace(/\bcite\b/gi, "")
          .trim();

        // JSONをパースしてバリデーション
        const parsed = JSON.parse(cleanedResponse);
        const analysisResult = StockAnalysisResultSchema.parse(parsed);

        // データベースに保存
        await saveStockAnalysis({
          stockId: stock.stockId,
          periodType: "long_term",
          result: analysisResult,
          rawResponse,
        });

        return {
          tickerCode: stock.tickerCode,
          name: stock.name,
          valueStockRating: analysisResult.valueStockRating,
        };
      });

      results.push(result);
    }

    return {
      message: `Monthly stock analysis completed for ${results.length} stocks`,
      periodType: "long_term",
      analyzedStocks: results,
    };
  },
);
