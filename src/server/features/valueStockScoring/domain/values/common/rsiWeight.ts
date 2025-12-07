import { z } from "zod";

/**
 * RSI重みスキーマ
 */
export const rsiWeightSchema = z.number().min(0).max(100).brand<"RsiWeight">();

export type RsiWeight = z.infer<typeof rsiWeightSchema>;
