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

import { importStocks, markDelistedStocks } from "../src/lib/jpx/stock-importer";
import { parseJPXStockList } from "../src/lib/jpx/stock-list-parser";

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
    const result = await importStocks(stocksData);

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
    const delistedCount = await markDelistedStocks(currentTickerCodes);

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
