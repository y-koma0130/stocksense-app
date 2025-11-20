import { db } from "../../../../../db";
import { stockScores } from "../../../../../db/schema";
import type { StockScore } from "../../domain/aggregates/stockScore";

/**
 * 株式スコアを保存する型定義
 */
export type SaveStockScore = (score: StockScore, scoreDate: string) => Promise<void>;

/**
 * 株式スコアをデータベースに保存
 */
export const saveStockScore: SaveStockScore = async (score, scoreDate) => {
  await db.insert(stockScores).values({
    stockId: score.stockId,
    scoreDate,
    scoreType: score.scoreType,
    perScore: score.perScore,
    pbrScore: score.pbrScore,
    rsiScore: score.rsiScore,
    priceRangeScore: score.priceRangeScore,
    sectorScore: score.sectorScore.toString(),
    totalScore: score.totalScore.toString(),
  });
};
