import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { filterLists } from "@/db/schema";

/**
 * フィルターリストを削除する
 */
export type DeleteFilterList = (id: string, userId: string) => Promise<void>;

export const deleteFilterList: DeleteFilterList = async (id, userId) => {
  await db.delete(filterLists).where(and(eq(filterLists.id, id), eq(filterLists.userId, userId)));
};
