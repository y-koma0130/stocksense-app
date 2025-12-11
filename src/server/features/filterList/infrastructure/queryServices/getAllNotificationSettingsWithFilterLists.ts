import { eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { filterLists, userNotificationSettings } from "@/db/schema";
import type { FilterListDataDto } from "../../application/dto/filterList.dto";

/**
 * 通知設定とフィルターリストの結合データ
 * ジョブから使用するための軽量DTOを返す
 */
export type NotificationSettingWithFilterList = Readonly<{
  userId: string;
  filterList: FilterListDataDto;
}>;

/**
 * フィルターリストが設定されている全ユーザーの通知設定を取得
 * 分析ジョブで各ユーザーのフィルター条件を収集するために使用
 */
export type GetAllNotificationSettingsWithFilterLists = () => Promise<
  NotificationSettingWithFilterList[]
>;

export const getAllNotificationSettingsWithFilterLists: GetAllNotificationSettingsWithFilterLists =
  async () => {
    const results = await db
      .select({
        userId: userNotificationSettings.userId,
        filterListId: filterLists.id,
        filterListName: filterLists.name,
        markets: filterLists.markets,
        sectorCodes: filterLists.sectorCodes,
        priceMin: filterLists.priceMin,
        priceMax: filterLists.priceMax,
      })
      .from(userNotificationSettings)
      .innerJoin(filterLists, eq(userNotificationSettings.notificationTargetListId, filterLists.id))
      .where(isNotNull(userNotificationSettings.notificationTargetListId));

    return results.map((row) => ({
      userId: row.userId,
      filterList: {
        id: row.filterListId,
        name: row.filterListName,
        markets: row.markets,
        sectorCodes: row.sectorCodes,
        priceMin: row.priceMin,
        priceMax: row.priceMax,
      },
    }));
  };
