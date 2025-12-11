import { eq } from "drizzle-orm";
import { db } from "@/db";
import { filterLists } from "@/db/schema";
import { createFilterList, type FilterListEntity } from "../../domain/entities/filterList";

/**
 * ユーザーIDからフィルターリスト一覧を取得
 */
export type GetFilterListsByUserId = (userId: string) => Promise<FilterListEntity[]>;

export const getFilterListsByUserId: GetFilterListsByUserId = async (userId) => {
  const result = await db
    .select()
    .from(filterLists)
    .where(eq(filterLists.userId, userId))
    .orderBy(filterLists.createdAt);

  return result.map((row) =>
    createFilterList({
      id: row.id,
      userId: row.userId,
      name: row.name,
      markets: row.markets,
      sectorCodes: row.sectorCodes,
      priceMin: row.priceMin,
      priceMax: row.priceMax,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),
  );
};
