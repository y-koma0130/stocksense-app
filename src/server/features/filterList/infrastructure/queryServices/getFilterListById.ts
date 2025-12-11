import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { filterLists } from "@/db/schema";
import { createFilterList, type FilterListEntity } from "../../domain/entities/filterList";

/**
 * IDからフィルターリストを取得（所有者チェック付き）
 */
export type GetFilterListById = (id: string, userId: string) => Promise<FilterListEntity | null>;

export const getFilterListById: GetFilterListById = async (id, userId) => {
  const result = await db
    .select()
    .from(filterLists)
    .where(and(eq(filterLists.id, id), eq(filterLists.userId, userId)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return createFilterList({
    id: row.id,
    userId: row.userId,
    name: row.name,
    markets: row.markets,
    sectorCodes: row.sectorCodes,
    priceMin: row.priceMin,
    priceMax: row.priceMax,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
};
