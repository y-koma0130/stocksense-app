import { eq } from "drizzle-orm";
import { db } from "../../../../../db";
import { sectorAverages } from "../../../../../db/schema";
import type { SectorAveragesAggregate } from "../../domain/aggregates/sectorAverages";

/**
 * 業種平均データを保存する型定義
 */
export type SaveSectorAverages = (aggregate: SectorAveragesAggregate) => Promise<void>;

/**
 * 業種平均データをデータベースに保存
 * 既存の同じdataDateのデータは削除してから挿入する
 */
export const saveSectorAverages: SaveSectorAverages = async (aggregate) => {
  if (aggregate.sectors.length === 0) {
    return;
  }

  // 同じdataDateの既存データを削除
  await db.delete(sectorAverages).where(eq(sectorAverages.dataDate, aggregate.dataDate));

  // 新しいデータを挿入
  await db.insert(sectorAverages).values(
    aggregate.sectors.map((sector) => ({
      sectorCode: sector.sectorCode,
      dataDate: aggregate.dataDate,
      avgPer: sector.avgPer?.toString() ?? null,
      avgPbr: sector.avgPbr?.toString() ?? null,
      medianPer: sector.medianPer?.toString() ?? null,
      medianPbr: sector.medianPbr?.toString() ?? null,
      stockCount: sector.stockCount,
    })),
  );
};
