import { z } from "zod";

/**
 * パース済み銘柄データのDTO
 */
export const parsedStockDataDtoSchema = z.object({
  tickerCode: z.string(),
  tickerSymbol: z.string(),
  name: z.string(),
  sectorCode: z.string(),
  sectorName: z.string(),
  largeSectorCode: z.string().nullable(),
  largeSectorName: z.string().nullable(),
  market: z.string(),
});

export type ParsedStockDataDto = z.infer<typeof parsedStockDataDtoSchema>;
