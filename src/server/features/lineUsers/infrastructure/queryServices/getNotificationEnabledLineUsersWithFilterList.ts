import { eq } from "drizzle-orm";
import { db } from "@/db";
import { filterLists, lineUsers, userNotificationSettings } from "@/db/schema";
import type { FilterListDataDto } from "@/server/features/filterList/application/dto/filterList.dto";

/**
 * 通知対象ユーザー（フィルターリスト付き）
 */
export type NotificationTargetUserWithFilterList = Readonly<{
  lineUserId: string;
  displayName: string | null;
  userId: string | null;
  filterList: FilterListDataDto | null;
}>;

/**
 * 通知が有効なLINEユーザーをフィルターリスト情報付きで取得
 * - フィルターリストが設定されている場合はその条件を返却
 * - 設定されていない場合はfilterList: nullを返却（デフォルト全銘柄）
 */
export type GetNotificationEnabledLineUsersWithFilterList = () => Promise<
  NotificationTargetUserWithFilterList[]
>;

export const getNotificationEnabledLineUsersWithFilterList: GetNotificationEnabledLineUsersWithFilterList =
  async () => {
    const results = await db
      .select({
        lineUserId: lineUsers.lineUserId,
        displayName: lineUsers.displayName,
        userId: lineUsers.userId,
        filterListId: filterLists.id,
        filterListName: filterLists.name,
        markets: filterLists.markets,
        sectorCodes: filterLists.sectorCodes,
        priceMin: filterLists.priceMin,
        priceMax: filterLists.priceMax,
      })
      .from(lineUsers)
      .leftJoin(userNotificationSettings, eq(lineUsers.userId, userNotificationSettings.userId))
      .leftJoin(filterLists, eq(userNotificationSettings.notificationTargetListId, filterLists.id))
      .where(eq(lineUsers.notificationEnabled, 1));

    return results.map((row) => ({
      lineUserId: row.lineUserId,
      displayName: row.displayName,
      userId: row.userId,
      filterList:
        row.filterListId && row.filterListName
          ? {
              id: row.filterListId,
              name: row.filterListName,
              markets: row.markets,
              sectorCodes: row.sectorCodes,
              priceMin: row.priceMin,
              priceMax: row.priceMax,
            }
          : null,
    }));
  };
