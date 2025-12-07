import { z } from "zod";
import { epsGrowthWeightSchema } from "../common/epsGrowthWeight";
import { pbrWeightSchema } from "../common/pbrWeight";
import { perWeightSchema } from "../common/perWeight";
import { priceRangeWeightSchema } from "../common/priceRangeWeight";
import { rsiWeightSchema } from "../common/rsiWeight";
import { tagScoreWeightSchema } from "../common/tagScoreWeight";
import { roeWeightSchema } from "./roeWeight";

/**
 * 長期スコアの重み配分スキーマ
 */
export const longTermWeightsSchema = z
  .object({
    per: perWeightSchema,
    pbr: pbrWeightSchema,
    rsi: rsiWeightSchema,
    priceRange: priceRangeWeightSchema,
    epsGrowth: epsGrowthWeightSchema,
    tagScore: tagScoreWeightSchema,
    roe: roeWeightSchema,
  })
  .brand<"LongTermWeights">();

export type LongTermWeights = z.infer<typeof longTermWeightsSchema>;
