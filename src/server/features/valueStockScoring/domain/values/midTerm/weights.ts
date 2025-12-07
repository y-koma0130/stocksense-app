import { z } from "zod";
import { epsGrowthWeightSchema } from "../common/epsGrowthWeight";
import { pbrWeightSchema } from "../common/pbrWeight";
import { perWeightSchema } from "../common/perWeight";
import { priceRangeWeightSchema } from "../common/priceRangeWeight";
import { rsiWeightSchema } from "../common/rsiWeight";
import { tagScoreWeightSchema } from "../common/tagScoreWeight";
import { rsiMomentumWeightSchema } from "./rsiMomentumWeight";
import { volumeSurgeWeightSchema } from "./volumeSurgeWeight";

/**
 * 中期スコアの重み配分スキーマ
 */
export const midTermWeightsSchema = z
  .object({
    per: perWeightSchema,
    pbr: pbrWeightSchema,
    rsi: rsiWeightSchema,
    priceRange: priceRangeWeightSchema,
    rsiMomentum: rsiMomentumWeightSchema,
    volumeSurge: volumeSurgeWeightSchema,
    epsGrowth: epsGrowthWeightSchema,
    tagScore: tagScoreWeightSchema,
  })
  .brand<"MidTermWeights">();

export type MidTermWeights = z.infer<typeof midTermWeightsSchema>;
