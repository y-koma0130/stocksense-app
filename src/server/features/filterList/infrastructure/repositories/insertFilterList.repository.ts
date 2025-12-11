import { db } from "@/db";
import { filterLists } from "@/db/schema";
import type { FilterListEntity } from "../../domain/entities/filterList";

/**
 * フィルターリストを挿入する
 */
export type InsertFilterList = (entity: FilterListEntity) => Promise<void>;

export const insertFilterList: InsertFilterList = async (entity) => {
  await db.insert(filterLists).values({
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    markets: entity.markets,
    sectorCodes: entity.sectorCodes,
    priceMin: entity.priceMin,
    priceMax: entity.priceMax,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
};
