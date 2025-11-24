import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sectorAverages } from "@/db/schema";

/**
 * 業種平均データDTO（簡易版）
 */
export const sectorAverageSimpleDtoSchema = z.object({
  sectorCode: z.string(),
  avgPer: z.number(),
  avgPbr: z.number(),
});

export type SectorAverageSimpleDto = z.infer<typeof sectorAverageSimpleDtoSchema>;

/**
 * 最新の業種平均データを取得する型定義
 */
export type GetLatestSectorAverages = () => Promise<SectorAverageSimpleDto[]>;

/**
 * 最新の業種平均データを取得
 */
export const getLatestSectorAverages: GetLatestSectorAverages = async () => {
  // 最新のdataDateを取得
  const latestRecord = await db
    .select({ dataDate: sectorAverages.dataDate })
    .from(sectorAverages)
    .orderBy(desc(sectorAverages.dataDate))
    .limit(1);

  if (latestRecord.length === 0) {
    return [];
  }

  const latestDate = latestRecord[0].dataDate;

  // 最新日付の全業種データを取得
  const sectors = await db
    .select({
      sectorCode: sectorAverages.sectorCode,
      avgPer: sectorAverages.avgPer,
      avgPbr: sectorAverages.avgPbr,
    })
    .from(sectorAverages)
    .where(eq(sectorAverages.dataDate, latestDate));

  // DTOに変換
  const result: SectorAverageSimpleDto[] = [];

  for (const sector of sectors) {
    const avgPer = sector.avgPer ? Number.parseFloat(sector.avgPer) : 0;
    const avgPbr = sector.avgPbr ? Number.parseFloat(sector.avgPbr) : 0;

    if (avgPer > 0 && avgPbr > 0) {
      result.push(
        sectorAverageSimpleDtoSchema.parse({
          sectorCode: sector.sectorCode,
          avgPer,
          avgPbr,
        }),
      );
    }
  }

  return result;
};
