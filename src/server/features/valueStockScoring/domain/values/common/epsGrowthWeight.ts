import { z } from "zod";

/**
 * EPS成長率重みスキーマ
 */
export const epsGrowthWeightSchema = z.number().min(0).max(100).brand<"EpsGrowthWeight">();

export type EpsGrowthWeight = z.infer<typeof epsGrowthWeightSchema>;
