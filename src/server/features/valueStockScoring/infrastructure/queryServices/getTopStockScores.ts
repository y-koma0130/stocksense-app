import { desc, eq } from "drizzle-orm";
import { db } from "../../../../../db";
import { stockScores, stocks } from "../../../../../db/schema";
import type { StockScoreDto } from "../../application/dto/stockScore.dto";

/**
 * スコア上位銘柄を取得する型定義
 */
export type GetTopStockScores = (params: {
  limit: number;
  scoreType?: "mid_term" | "long_term";
}) => Promise<ReadonlyArray<StockScoreDto>>;

/**
 * スコア上位銘柄を取得
 * 最新のスコア日付から上位N件を取得
 */
export const getTopStockScores: GetTopStockScores = async ({ limit, scoreType }) => {
  // 最新のscoreDateを取得
  const latestRecord = await db
    .select({ scoreDate: stockScores.scoreDate })
    .from(stockScores)
    .orderBy(desc(stockScores.scoreDate))
    .limit(1);

  if (latestRecord.length === 0) {
    return [];
  }

  const latestDate = latestRecord[0].scoreDate;

  // クエリビルダー作成
  let query = db
    .select({
      stockId: stockScores.stockId,
      tickerCode: stocks.tickerCode,
      tickerSymbol: stocks.tickerSymbol,
      name: stocks.name,
      sectorCode: stocks.sectorCode,
      sectorName: stocks.sectorName,
      scoreDate: stockScores.scoreDate,
      scoreType: stockScores.scoreType,
      perScore: stockScores.perScore,
      pbrScore: stockScores.pbrScore,
      rsiScore: stockScores.rsiScore,
      priceRangeScore: stockScores.priceRangeScore,
      sectorScore: stockScores.sectorScore,
      totalScore: stockScores.totalScore,
    })
    .from(stockScores)
    .innerJoin(stocks, eq(stockScores.stockId, stocks.id))
    .where(eq(stockScores.scoreDate, latestDate))
    .$dynamic();

  // scoreTypeが指定されている場合はフィルタ
  if (scoreType) {
    query = query.where(eq(stockScores.scoreType, scoreType));
  }

  // 実行
  const results = await query.orderBy(desc(stockScores.totalScore)).limit(limit);

  // DTOに変換
  return results.map((row) => ({
    stockId: row.stockId,
    tickerCode: row.tickerCode,
    tickerSymbol: row.tickerSymbol,
    name: row.name,
    sectorCode: row.sectorCode,
    sectorName: row.sectorName,
    scoreDate: row.scoreDate,
    scoreType: row.scoreType,
    perScore: row.perScore,
    pbrScore: row.pbrScore,
    rsiScore: row.rsiScore,
    priceRangeScore: row.priceRangeScore,
    sectorScore: Number.parseFloat(row.sectorScore),
    totalScore: Number.parseFloat(row.totalScore),
  }));
};
