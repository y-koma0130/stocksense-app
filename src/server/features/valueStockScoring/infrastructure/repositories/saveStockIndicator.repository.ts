import { db } from "@/db";
import { stockIndicators } from "@/db/schema";
import type { StockIndicator } from "../../domain/entities/stockIndicator";

/**
 * 銘柄指標を保存する関数の型定義
 */
export type SaveStockIndicator = (indicator: StockIndicator) => Promise<void>;

/**
 * 銘柄指標をDBに保存する
 * UNIQUE制約違反の場合はエラーをスローする
 */
export const saveStockIndicator: SaveStockIndicator = async (indicator) => {
  await db.insert(stockIndicators).values({
    stockId: indicator.stockId,
    collectedAt: indicator.collectedAt,
    periodType: indicator.periodType,
    currentPrice: indicator.currentPrice?.toString() ?? null,
    per: indicator.per?.toString() ?? null,
    pbr: indicator.pbr?.toString() ?? null,
    rsi: indicator.rsi?.toString() ?? null,
    week52High: indicator.week52High?.toString() ?? null,
    week52Low: indicator.week52Low?.toString() ?? null,
    sectorCode: indicator.sectorCode,
    sectorAvgPer: indicator.sectorAvgPer?.toString() ?? null,
    sectorAvgPbr: indicator.sectorAvgPbr?.toString() ?? null,
  });
};
