import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { filterLists } from "@/db/schema";

/**
 * ユーザーのフィルターリスト数をカウント
 */
export type CountFilterListsByUserId = (userId: string) => Promise<number>;

export const countFilterListsByUserId: CountFilterListsByUserId = async (userId) => {
  const result = await db
    .select({ count: count() })
    .from(filterLists)
    .where(eq(filterLists.userId, userId));

  return result[0]?.count ?? 0;
};
