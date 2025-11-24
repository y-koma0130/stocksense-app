/**
 * 銘柄マスターデータインポートスクリプト
 *
 * 使い方:
 * 1. JPX公式サイトから東証上場銘柄一覧Excelをダウンロード
 *    https://www.jpx.co.jp/markets/statistics-equities/misc/01.html
 * 2. ファイルをdata/ディレクトリに配置
 * 3. pnpm tsx scripts/import-stocks.ts <ファイルパス>
 *
 * 例:
 * pnpm tsx scripts/import-stocks.ts ./data/data_j.xls
 */

import { and, eq, isNull, notInArray } from "drizzle-orm";
import { db } from "../src/db";
import { stocks } from "../src/db/schema";
import type { ParsedStockDataDto } from "../src/server/features/valueStockScoring/application/dto/jpx.dto";
import { parseJPXStockList } from "../src/server/features/valueStockScoring/infrastructure/externalServices/parseJPXStockList";

type ImportResult = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

const importStocksData = async (stocksData: ParsedStockDataDto[]): Promise<ImportResult> => {
  const result: ImportResult = {
    total: stocksData.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  console.log("  既存銘柄を確認中...");

  // 全ticker_codeを一度に取得（deletedAtがNULLの上場中銘柄のみ）
  const existingStocks = await db
    .select({ tickerCode: stocks.tickerCode })
    .from(stocks)
    .where(isNull(stocks.deletedAt));

  const existingTickerCodesSet = new Set(existingStocks.map((s) => s.tickerCode));

  // 新規と更新に分類
  const toCreate: ParsedStockDataDto[] = [];
  const toUpdate: ParsedStockDataDto[] = [];

  for (const stockData of stocksData) {
    if (existingTickerCodesSet.has(stockData.tickerCode)) {
      toUpdate.push(stockData);
    } else {
      toCreate.push(stockData);
    }
  }

  console.log(`  新規: ${toCreate.length}件、更新: ${toUpdate.length}件`);

  // 新規銘柄を一括挿入
  if (toCreate.length > 0) {
    console.log("  新規銘柄を一括挿入中...");
    try {
      await db.insert(stocks).values(
        toCreate.map((s) => ({
          tickerCode: s.tickerCode,
          tickerSymbol: s.tickerSymbol,
          name: s.name,
          sectorCode: s.sectorCode,
          sectorName: s.sectorName,
          market: s.market,
        })),
      );
      result.created = toCreate.length;
    } catch (error) {
      result.errors.push(
        `一括挿入エラー: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // 既存銘柄を1件ずつ更新（Drizzleは一括UPDATEが難しいため）
  if (toUpdate.length > 0) {
    console.log("  既存銘柄を更新中...");
    let processed = 0;

    for (const stockData of toUpdate) {
      try {
        await db
          .update(stocks)
          .set({
            tickerSymbol: stockData.tickerSymbol,
            name: stockData.name,
            sectorCode: stockData.sectorCode,
            sectorName: stockData.sectorName,
            market: stockData.market,
            deletedAt: null, // 再上場対応
            updatedAt: new Date(),
          })
          .where(eq(stocks.tickerCode, stockData.tickerCode));

        result.updated++;
        processed++;

        // 100件ごとに進捗表示
        if (processed % 100 === 0) {
          console.log(
            `    進捗: ${processed}/${toUpdate.length}件 (${Math.round((processed / toUpdate.length) * 100)}%)`,
          );
        }
      } catch (error) {
        result.errors.push(
          `${stockData.tickerCode}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  return result;
};

const markDelistedStocksData = async (currentTickerCodes: string[]): Promise<number> => {
  if (currentTickerCodes.length === 0) {
    return 0;
  }

  const result = await db
    .update(stocks)
    .set({ deletedAt: new Date() })
    .where(and(notInArray(stocks.tickerCode, currentTickerCodes), isNull(stocks.deletedAt)))
    .returning({ id: stocks.id });

  return result.length;
};

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("エラー: Excelファイルのパスを指定してください");
    console.log("\n使い方: pnpm tsx scripts/import-stocks.ts <ファイルパス>");
    console.log("例: pnpm tsx scripts/import-stocks.ts ./data/data_j.xls");
    process.exit(1);
  }

  const filePath = args[0];

  try {
    console.log("📊 JPX銘柄一覧をパース中...");
    const stocksData = parseJPXStockList(filePath);
    console.log(`✅ ${stocksData.length}件の銘柄データをパースしました\n`);

    // 市場区分ごとの集計
    const marketCounts = stocksData.reduce(
      (acc, stock) => {
        acc[stock.market] = (acc[stock.market] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("市場区分別の内訳:");
    for (const [market, count] of Object.entries(marketCounts)) {
      console.log(`  ${market}: ${count}件`);
    }
    console.log();

    console.log("💾 データベースにインポート中...");
    const result = await importStocksData(stocksData);

    console.log("\n✅ インポート完了");
    console.log(`  合計: ${result.total}件`);
    console.log(`  新規作成: ${result.created}件`);
    console.log(`  更新: ${result.updated}件`);
    console.log(`  スキップ: ${result.skipped}件`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  エラー: ${result.errors.length}件`);
      result.errors.slice(0, 5).forEach((error) => {
        console.log(`  - ${error}`);
      });
      if (result.errors.length > 5) {
        console.log(`  ... 他${result.errors.length - 5}件`);
      }
    }

    // 上場廃止銘柄の検出
    console.log("\n🔍 上場廃止銘柄を確認中...");
    const currentTickerCodes = stocksData.map((s) => s.tickerCode);
    const delistedCount = await markDelistedStocksData(currentTickerCodes);

    if (delistedCount > 0) {
      console.log(`⚠️  ${delistedCount}件の銘柄を上場廃止としてマークしました`);
    } else {
      console.log("✅ 上場廃止銘柄はありませんでした");
    }

    console.log("\n🎉 処理が完了しました");
  } catch (error) {
    console.error("\n❌ エラーが発生しました:");
    console.error(error);
    process.exit(1);
  }
}

main();
