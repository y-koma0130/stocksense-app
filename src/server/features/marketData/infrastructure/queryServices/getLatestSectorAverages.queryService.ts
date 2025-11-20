import { desc, eq } from "drizzle-orm";
import { db } from "../../../../../db";
import { sectorAverages } from "../../../../../db/schema";

/**
 * 最新の業種平均データを取得する型定義
 */
export type GetLatestSectorAverages = () => Promise<
  Map<string, { avgPer: number; avgPbr: number }>
>;

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
    return new Map();
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

  // Mapに変換
  const sectorMap = new Map<string, { avgPer: number; avgPbr: number }>();

  for (const sector of sectors) {
    const avgPer = sector.avgPer ? Number.parseFloat(sector.avgPer) : 0;
    const avgPbr = sector.avgPbr ? Number.parseFloat(sector.avgPbr) : 0;

    if (avgPer > 0 && avgPbr > 0) {
      sectorMap.set(sector.sectorCode, { avgPer, avgPbr });
    }
  }

  return sectorMap;
};
