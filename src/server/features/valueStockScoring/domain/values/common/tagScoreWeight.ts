import { z } from "zod";

/**
 * タグスコア重みスキーマ
 */
export const tagScoreWeightSchema = z.number().min(0).max(100).brand<"TagScoreWeight">();

export type TagScoreWeight = z.infer<typeof tagScoreWeightSchema>;
