import { z } from "zod";

/**
 * 出来高急増重みスキーマ（中期専用）
 */
export const volumeSurgeWeightSchema = z.number().min(0).max(100).brand<"VolumeSurgeWeight">();

export type VolumeSurgeWeight = z.infer<typeof volumeSurgeWeightSchema>;
