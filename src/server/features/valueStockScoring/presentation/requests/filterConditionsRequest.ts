import { z } from "zod";
import type { FilterConditionsInputDto } from "../../application/dto/filterConditionsInput.dto";

export const filterConditionsRequestSchema = z.object({
  sectorCodes: z.array(z.string()).nullable().optional(),
  markets: z.array(z.string()).nullable().optional(),
  priceRange: z
    .object({
      min: z.number().nullable(),
      max: z.number().nullable(),
    })
    .nullable()
    .optional(),
}) satisfies z.ZodType<FilterConditionsInputDto>;
