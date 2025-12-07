import { z } from "zod";
import type { FilterConditionsInputDto } from "../../application/dto/filterConditionsInput.dto";

export const filterConditionsRequestSchema = z.object({
  sectorCodes: z.array(z.string()).optional(),
  markets: z.array(z.string()).optional(),
  macroTagIds: z.array(z.string()).optional(),
  themeTagIds: z.array(z.string()).optional(),
  priceRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
}) satisfies z.ZodType<FilterConditionsInputDto>;
