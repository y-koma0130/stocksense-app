import { eq } from "drizzle-orm";
import { db } from "../../db";
import { stocks } from "../../db/schema";
import type { ParsedStockData } from "./stock-list-parser";

/**
 * インポート結果の型
 */
export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * パース済み銘柄データをデータベースにインポート
 *
 * @param stocksData - パース済み銘柄データの配列
 * @returns インポート結果
 */
export async function importStocks(stocksData: ParsedStockData[]): Promise<ImportResult> {
  const result: ImportResult = {
    total: stocksData.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // 既存の全銘柄コードを取得（更新/新規の判定用）
    const existingStocks = await db.select({ tickerCode: stocks.tickerCode }).from(stocks);
    const existingTickerCodes = new Set(existingStocks.map((s) => s.tickerCode));

    // バッチサイズ（一度に処理する件数）
    const batchSize = 500;
    const now = new Date();

    for (let i = 0; i < stocksData.length; i += batchSize) {
      const batch = stocksData.slice(i, i + batchSize);

      // ON CONFLICTを使った一括upsert
      await db
        .insert(stocks)
        .values(
          batch.map((stock) => ({
            tickerCode: stock.tickerCode,
            tickerSymbol: stock.tickerSymbol,
            name: stock.name,
            sectorCode: stock.sectorCode || null,
            sectorName: stock.sectorName || null,
            market: stock.market || null,
          })),
        )
        .onConflictDoUpdate({
          target: stocks.tickerCode,
          set: {
            tickerSymbol: stocks.tickerSymbol,
            name: stocks.name,
            sectorCode: stocks.sectorCode,
            sectorName: stocks.sectorName,
            market: stocks.market,
            updatedAt: now,
          },
        });

      // 進捗表示
      const processed = Math.min(i + batchSize, stocksData.length);
      process.stdout.write(`\r  処理中: ${processed}/${stocksData.length}件`);
    }

    console.log(); // 改行

    // 新規/更新件数を集計
    for (const stock of stocksData) {
      if (existingTickerCodes.has(stock.tickerCode)) {
        result.updated++;
      } else {
        result.created++;
      }
    }
  } catch (error) {
    const errorMessage = `Failed to import stocks: ${error instanceof Error ? error.message : String(error)}`;
    result.errors.push(errorMessage);
    console.error(errorMessage);
  }

  return result;
}

/**
 * 上場廃止銘柄を検出してdeleted_atを設定
 *
 * @param currentTickerCodes - 現在の銘柄コードリスト
 * @returns 廃止処理した件数
 */
export async function markDelistedStocks(currentTickerCodes: string[]): Promise<number> {
  // データベース内の全銘柄を取得
  const allStocks = await db.select().from(stocks);

  let delistedCount = 0;

  for (const stock of allStocks) {
    // 現在のリストに存在せず、まだ削除マークがついていない銘柄
    if (!currentTickerCodes.includes(stock.tickerCode) && !stock.deletedAt) {
      await db
        .update(stocks)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(stocks.id, stock.id));
      delistedCount++;
    }
  }

  return delistedCount;
}
