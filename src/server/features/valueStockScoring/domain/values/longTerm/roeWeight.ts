import { z } from "zod";

/**
 * ROE重みスキーマ（長期専用）
 */
export const roeWeightSchema = z.number().min(0).max(100).brand<"RoeWeight">();

export type RoeWeight = z.infer<typeof roeWeightSchema>;
