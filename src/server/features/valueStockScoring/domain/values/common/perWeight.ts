import { z } from "zod";

/**
 * PER重みスキーマ
 */
export const perWeightSchema = z.number().min(0).max(100).brand<"PerWeight">();

export type PerWeight = z.infer<typeof perWeightSchema>;
