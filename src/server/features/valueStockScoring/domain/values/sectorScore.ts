import { z } from "zod";

/**
 * 業種スコアのZodスキーマ（0〜100の連続値）
 */
export const sectorScoreSchema = z.number().min(0).max(100).brand<"SectorScore">();

export type SectorScore = z.infer<typeof sectorScoreSchema>;
