import { z } from "zod";

/**
 * 市場タイプのZodスキーマ
 */
export const marketTypeSchema = z.enum(["prime", "standard", "growth", "other"]);

/**
 * 市場タイプの型定義
 */
export type MarketType = z.infer<typeof marketTypeSchema>;

/**
 * 市場タイプの定数
 */
export const MARKET_TYPES = {
  PRIME: "prime",
  STANDARD: "standard",
  GROWTH: "growth",
  OTHER: "other",
} as const;

/**
 * 市場名から市場タイプを取得
 */
export const getMarketType = (market: string | null): MarketType => {
  if (!market) return MARKET_TYPES.OTHER;
  if (market.includes("プライム")) return MARKET_TYPES.PRIME;
  if (market.includes("スタンダード")) return MARKET_TYPES.STANDARD;
  if (market.includes("グロース")) return MARKET_TYPES.GROWTH;
  return MARKET_TYPES.OTHER;
};
