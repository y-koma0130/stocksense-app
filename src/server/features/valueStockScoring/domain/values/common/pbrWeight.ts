import { z } from "zod";

/**
 * PBR重みスキーマ
 */
export const pbrWeightSchema = z.number().min(0).max(100).brand<"PbrWeight">();

export type PbrWeight = z.infer<typeof pbrWeightSchema>;
