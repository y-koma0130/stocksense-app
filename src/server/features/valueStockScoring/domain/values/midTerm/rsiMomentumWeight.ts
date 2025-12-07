import { z } from "zod";

/**
 * RSIモメンタム重みスキーマ（中期専用）
 */
export const rsiMomentumWeightSchema = z.number().min(0).max(100).brand<"RsiMomentumWeight">();

export type RsiMomentumWeight = z.infer<typeof rsiMomentumWeightSchema>;
