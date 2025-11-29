import { db } from "@/db";
import { midTermIndicators } from "@/db/schema";
import type { MidTermIndicator } from "../../domain/entities/midTermIndicator";

/**
 * 中期指標を保存する関数の型定義
 */
export type SaveMidTermIndicator = (indicator: MidTermIndicator) => Promise<void>;

/**
 * 中期指標をDBに保存する
 * UNIQUE制約違反の場合はエラーをスローする
 */
export const saveMidTermIndicator: SaveMidTermIndicator = async (indicator) => {
  await db.insert(midTermIndicators).values({
    stockId: indicator.stockId,
    collectedAt: indicator.collectedAt,
    currentPrice: indicator.currentPrice?.toString() ?? null,
    per: indicator.per?.toString() ?? null,
    pbr: indicator.pbr?.toString() ?? null,
    rsi: indicator.rsi?.toString() ?? null,
    rsiShort: indicator.rsiShort?.toString() ?? null,
    priceHigh: indicator.priceHigh?.toString() ?? null,
    priceLow: indicator.priceLow?.toString() ?? null,
    sectorCode: indicator.sectorCode,
  });
};
