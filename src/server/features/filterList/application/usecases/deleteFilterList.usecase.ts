import type { ValidateListOwnership } from "../../domain/services/validateListOwnership.service";
import type { GetFilterListById } from "../../infrastructure/queryServices/getFilterListById";
import type { GetNotificationSettingsByUserId } from "../../infrastructure/queryServices/getNotificationSettingsByUserId";
import type { DeleteFilterList } from "../../infrastructure/repositories/deleteFilterList.repository";
import type { UpsertNotificationSettings } from "../../infrastructure/repositories/upsertNotificationSettings.repository";

type Dependencies = Readonly<{
  getFilterListById: GetFilterListById;
  getNotificationSettingsByUserId: GetNotificationSettingsByUserId;
  deleteFilterList: DeleteFilterList;
  upsertNotificationSettings: UpsertNotificationSettings;
  validateListOwnership: ValidateListOwnership;
}>;

type Params = Readonly<{
  id: string;
  userId: string;
}>;

export type DeleteFilterListUsecase = (deps: Dependencies, params: Params) => Promise<void>;

export const deleteFilterListUsecase: DeleteFilterListUsecase = async (deps, params) => {
  // 既存レコード取得・所有者チェック
  const fetched = await deps.getFilterListById(params.id, params.userId);
  deps.validateListOwnership(fetched);

  // 通知設定を確認し、削除対象が通知対象ならnullに戻す
  const notificationSettings = await deps.getNotificationSettingsByUserId(params.userId);
  if (notificationSettings?.notificationTargetListId === params.id) {
    await deps.upsertNotificationSettings(params.userId, null);
  }

  // 削除
  await deps.deleteFilterList(params.id, params.userId);
};
