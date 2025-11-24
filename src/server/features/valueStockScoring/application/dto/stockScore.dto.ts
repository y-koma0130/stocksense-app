import { z } from "zod";

/**
 * 株式スコアのDTO
 */
export const stockScoreDtoSchema = z.object({
  stockId: z.string(),
  tickerCode: z.string(),
  tickerSymbol: z.string(),
  name: z.string(),
  sectorCode: z.string().nullable(),
  sectorName: z.string().nullable(),
  scoreDate: z.string(),
  scoreType: z.enum(["mid_term", "long_term"]),
  perScore: z.number(),
  pbrScore: z.number(),
  rsiScore: z.number(),
  priceRangeScore: z.number(),
  sectorScore: z.number(),
  totalScore: z.number(),
});

export type StockScoreDto = z.infer<typeof stockScoreDtoSchema>;
