/**
 * 銘柄タグ分類スクリプト（Yahoo Finance版）
 *
 * 使い方:
 * pnpm tsx scripts/classify-stock-tags.ts [--dry-run] [--limit N]
 *
 * オプション:
 * --dry-run: DBに保存せず結果を表示のみ
 * --limit N: 処理する銘柄数を制限（トークン確認用）
 */

import { eq, isNull } from "drizzle-orm";
import OpenAI from "openai";
import YahooFinance from "yahoo-finance2";
import { z } from "zod";
import { db } from "../src/db";
import { stocks, stockMacroTags, stockThemeTags } from "../src/db/schema";
import { MACRO_TAGS } from "../src/server/features/stockTagging/domain/values/macroTags";
import { THEME_TAGS } from "../src/server/features/stockTagging/domain/values/themeTags";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// LLMレスポンススキーマ
const TaggingResultSchema = z.object({
  macroTags: z.array(
    z.object({
      id: z.string(),
      confidence: z.number().min(0).max(1),
    }),
  ),
  themeTags: z.array(
    z.object({
      id: z.string(),
      confidence: z.number().min(0).max(1),
    }),
  ),
});

type TaggingResult = z.infer<typeof TaggingResultSchema>;

type StockInfo = {
  id: string;
  tickerCode: string;
  tickerSymbol: string;
  name: string;
  sectorName: string | null;
  largeSectorName: string | null;
  market: string | null;
};

/**
 * Yahoo Financeから企業概要を取得
 */
const getBusinessSummary = async (tickerSymbol: string): Promise<string | null> => {
  try {
    const result = await yahooFinance.quoteSummary(tickerSymbol, {
      modules: ["assetProfile"],
    });
    return result.assetProfile?.longBusinessSummary || null;
  } catch {
    return null;
  }
};

/**
 * タグ分類プロンプトを生成
 */
const buildTaggingPrompt = (stock: StockInfo, businessSummary: string | null): string => {
  const macroTagList = MACRO_TAGS.map((t) => `- ${t.id}: ${t.name} - ${t.description}`).join("\n");
  const themeTagList = THEME_TAGS.map((t) => `- ${t.id}: ${t.name} - ${t.description}`).join("\n");

  return `あなたは日本株の分類エキスパートです。以下の企業情報を分析し、該当するタグを選択してください。

## 企業情報
会社名: ${stock.name}
証券コード: ${stock.tickerCode}
業種（33業種）: ${stock.sectorName || "不明"}
大業種（17業種）: ${stock.largeSectorName || "不明"}
市場: ${stock.market || "不明"}
${businessSummary ? `\n事業概要:\n${businessSummary}` : ""}

## マクロタグ（マクロ経済感応度）
マクロタグは、金利・為替・景気などのマクロ経済要因が企業業績に与える影響を分類するためのタグです。
投資家がマクロ経済環境の変化に応じて銘柄をフィルタリングするために使用します。
該当するものを全て選択してください。
${macroTagList}

## テーマタグ（事業テーマ）
テーマタグは、企業の主要な事業領域や成長テーマを分類するためのタグです。
投資家が特定のテーマや業界に関連する銘柄を探すために使用します。
該当するものを全て選択してください（最大5つまで）。
${themeTagList}

## 注意事項
- 無理にタグを付与する必要はありません
- 影響が軽微または判断が難しい場合は付与しないでください
- 確実に該当するものだけを選択してください

## 出力形式
以下のJSON形式で回答してください。
- confidence: 確信度（0.7以上のみ出力）
- 該当なしの場合は空配列

{
  "macroTags": [{"id": "タグID", "confidence": 0.8}],
  "themeTags": [{"id": "タグID", "confidence": 0.9}]
}`;
};

/**
 * LLMでタグ分類を実行
 */
const classifyWithLLM = async (
  openai: OpenAI,
  stock: StockInfo,
  businessSummary: string | null,
): Promise<{ result: TaggingResult; usage: OpenAI.CompletionUsage | undefined }> => {
  const prompt = buildTaggingPrompt(stock, businessSummary);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from LLM");
  }

  const parsed = JSON.parse(content);
  const result = TaggingResultSchema.parse(parsed);

  return { result, usage: response.usage };
};

/**
 * タグをDBに保存（洗い替え方式：既存タグを削除してから挿入）
 */
const saveTags = async (stockId: string, result: TaggingResult): Promise<void> => {
  // マクロタグを洗い替え
  await db.delete(stockMacroTags).where(eq(stockMacroTags.stockId, stockId));
  for (const tag of result.macroTags) {
    await db.insert(stockMacroTags).values({
      stockId,
      macroTagId: tag.id,
      confidence: String(tag.confidence),
    });
  }

  // テーマタグを洗い替え
  await db.delete(stockThemeTags).where(eq(stockThemeTags.stockId, stockId));
  for (const tag of result.themeTags) {
    await db.insert(stockThemeTags).values({
      stockId,
      themeTagId: tag.id,
      confidence: String(tag.confidence),
    });
  }
};

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : undefined;

  // OpenAIクライアント初期化
  const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // DBから上場中の銘柄を取得
  const stockList = await db
    .select({
      id: stocks.id,
      tickerCode: stocks.tickerCode,
      tickerSymbol: stocks.tickerSymbol,
      name: stocks.name,
      sectorName: stocks.sectorName,
      largeSectorName: stocks.largeSectorName,
      market: stocks.market,
    })
    .from(stocks)
    .where(isNull(stocks.deletedAt));

  console.log(`上場銘柄数: ${stockList.length}`);

  // 処理対象を絞り込み
  const targets = limit ? stockList.slice(0, limit) : stockList;
  console.log(`処理対象: ${targets.length}件${dryRun ? " (dry-run)" : ""}\n`);

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let processed = 0;
  let withSummary = 0;

  for (const stock of targets) {
    try {
      // Yahoo Financeから企業概要を取得
      const businessSummary = await getBusinessSummary(stock.tickerSymbol);
      if (businessSummary) withSummary++;

      const { result, usage } = await classifyWithLLM(openaiClient, stock, businessSummary);

      if (usage) {
        totalInputTokens += usage.prompt_tokens;
        totalOutputTokens += usage.completion_tokens;
      }

      console.log(`\n${stock.tickerCode} ${stock.name}`);
      console.log(`  概要: ${businessSummary ? "あり" : "なし"}`);
      console.log(`  マクロ: ${result.macroTags.map((t) => t.id).join(", ") || "なし"}`);
      console.log(`  テーマ: ${result.themeTags.map((t) => t.id).join(", ") || "なし"}`);

      if (!dryRun) {
        await saveTags(stock.id, result);
      }

      processed++;

      // レート制限対策
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error: ${stock.tickerCode}`, error);
    }
  }

  console.log("\n===== 結果 =====");
  console.log(`処理件数: ${processed}件`);
  console.log(`概要取得: ${withSummary}件 (${Math.round((withSummary / processed) * 100)}%)`);
  console.log(`入力トークン: ${totalInputTokens.toLocaleString()}`);
  console.log(`出力トークン: ${totalOutputTokens.toLocaleString()}`);
  console.log(`合計トークン: ${(totalInputTokens + totalOutputTokens).toLocaleString()}`);

  if (processed > 0) {
    console.log(`\n1件あたり平均:`);
    console.log(`  入力: ${Math.round(totalInputTokens / processed).toLocaleString()} tokens`);
    console.log(`  出力: ${Math.round(totalOutputTokens / processed).toLocaleString()} tokens`);
  }
}

main().catch(console.error);
