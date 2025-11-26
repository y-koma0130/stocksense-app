import { db } from "@/db";
import { longTermIndicators } from "@/db/schema";
import type { LongTermIndicator } from "../../domain/entities/longTermIndicator";

/**
 * 長期指標を保存する関数の型定義
 */
export type SaveLongTermIndicator = (indicator: LongTermIndicator) => Promise<void>;

/**
 * 長期指標をDBに保存する
 * UNIQUE制約違反の場合はエラーをスローする
 */
export const saveLongTermIndicator: SaveLongTermIndicator = async (indicator) => {
  await db.insert(longTermIndicators).values({
    stockId: indicator.stockId,
    collectedAt: indicator.collectedAt,
    currentPrice: indicator.currentPrice?.toString() ?? null,
    per: indicator.per?.toString() ?? null,
    pbr: indicator.pbr?.toString() ?? null,
    rsi: indicator.rsi?.toString() ?? null,
    priceHigh: indicator.priceHigh?.toString() ?? null,
    priceLow: indicator.priceLow?.toString() ?? null,
    sectorCode: indicator.sectorCode,
  });
};
