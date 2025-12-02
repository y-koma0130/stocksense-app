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

import { and, isNull, notInArray, sql } from "drizzle-orm";
import { db } from "../src/db";
import { stocks } from "../src/db/schema";
import type { ParsedStockDataDto } from "../src/server/features/valueStockScoring/application/dto/jpx.dto";
import { parseJPXStockList } from "../src/server/features/valueStockScoring/infrastructure/externalServices/parseJPXStockList";

type ImportResult = {
  total: number;
  upserted: number;
  errors: string[];
};

const BATCH_SIZE = 500;

/**
 * 銘柄データをupsert（バッチ処理）
 */
const importStocksData = async (stocksData: ParsedStockDataDto[]): Promise<ImportResult> => {
  const result: ImportResult = {
    total: stocksData.length,
    upserted: 0,
    errors: [],
  };

  console.log(`  ${stocksData.length}件を${BATCH_SIZE}件ずつupsert中...`);

  // バッチに分割して処理
  for (let i = 0; i < stocksData.length; i += BATCH_SIZE) {
    const batch = stocksData.slice(i, i + BATCH_SIZE);

    try {
      await db
        .insert(stocks)
        .values(
          batch.map((s) => ({
            tickerCode: s.tickerCode,
            tickerSymbol: s.tickerSymbol,
            name: s.name,
            sectorCode: s.sectorCode,
            sectorName: s.sectorName,
            largeSectorCode: s.largeSectorCode,
            largeSectorName: s.largeSectorName,
            market: s.market,
          })),
        )
        .onConflictDoUpdate({
          target: stocks.tickerCode,
          set: {
            tickerSymbol: sql`excluded.ticker_symbol`,
            name: sql`excluded.name`,
            sectorCode: sql`excluded.sector_code`,
            sectorName: sql`excluded.sector_name`,
            largeSectorCode: sql`excluded.large_sector_code`,
            largeSectorName: sql`excluded.large_sector_name`,
            market: sql`excluded.market`,
            deletedAt: sql`NULL`, // 再上場対応
            updatedAt: sql`NOW()`,
          },
        });

      result.upserted += batch.length;

      // 進捗表示
      const progress = Math.min(i + BATCH_SIZE, stocksData.length);
      console.log(
        `    進捗: ${progress}/${stocksData.length}件 (${Math.round((progress / stocksData.length) * 100)}%)`,
      );
    } catch (error) {
      result.errors.push(
        `バッチ ${i}-${i + batch.length} エラー: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return result;
};

/**
 * 上場廃止銘柄をマーク
 */
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

    // 17業種の集計
    const largeSectorCounts = stocksData.reduce(
      (acc, stock) => {
        const key = stock.largeSectorName ?? "不明";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("17業種別の内訳:");
    for (const [sector, count] of Object.entries(largeSectorCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${sector}: ${count}件`);
    }
    console.log();

    console.log("💾 データベースにインポート中...");
    const result = await importStocksData(stocksData);

    console.log("\n✅ インポート完了");
    console.log(`  合計: ${result.total}件`);
    console.log(`  Upsert: ${result.upserted}件`);

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
