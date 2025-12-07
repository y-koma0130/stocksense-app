import { z } from "zod";

/**
 * 価格レンジ重みスキーマ
 */
export const priceRangeWeightSchema = z.number().min(0).max(100).brand<"PriceRangeWeight">();

export type PriceRangeWeight = z.infer<typeof priceRangeWeightSchema>;
