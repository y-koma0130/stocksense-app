import { z } from "zod";

/**
 * 業種平均データDTO
 *
 * JPX公式Excelから取得した業種別平均PER/PBRデータ
 */
export const sectorAverageDataDtoSchema = z.object({
  sectorCode: z.string(),
  sectorName: z.string(),
  avgPer: z.number().nullable(),
  avgPbr: z.number().nullable(),
  medianPer: z.number().nullable(),
  medianPbr: z.number().nullable(),
  stockCount: z.number().int(),
});

export type SectorAverageDataDto = z.infer<typeof sectorAverageDataDtoSchema>;
