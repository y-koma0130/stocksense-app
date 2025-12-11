import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { filterLists } from "@/db/schema";
import { nowJST } from "@/lib/datetime/jst";
import type { FilterListEntity } from "../../domain/entities/filterList";

/**
 * フィルターリストを更新する
 */
export type UpdateFilterList = (entity: FilterListEntity) => Promise<void>;

export const updateFilterList: UpdateFilterList = async (entity) => {
  await db
    .update(filterLists)
    .set({
      name: entity.name,
      markets: entity.markets,
      sectorCodes: entity.sectorCodes,
      priceMin: entity.priceMin,
      priceMax: entity.priceMax,
      updatedAt: nowJST(),
    })
    .where(and(eq(filterLists.id, entity.id), eq(filterLists.userId, entity.userId)));
};
