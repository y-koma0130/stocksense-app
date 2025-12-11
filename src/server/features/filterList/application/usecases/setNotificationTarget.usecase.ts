import type { ValidateListOwnership } from "../../domain/services/validateListOwnership.service";
import type { GetFilterListById } from "../../infrastructure/queryServices/getFilterListById";
import type { UpsertNotificationSettings } from "../../infrastructure/repositories/upsertNotificationSettings.repository";

type Dependencies = Readonly<{
  getFilterListById: GetFilterListById;
  upsertNotificationSettings: UpsertNotificationSettings;
  validateListOwnership: ValidateListOwnership;
}>;

type Params = Readonly<{
  userId: string;
  listId: string | null; // nullの場合はデフォルト（全銘柄）
}>;

export type SetNotificationTargetUsecase = (deps: Dependencies, params: Params) => Promise<void>;

export const setNotificationTargetUsecase: SetNotificationTargetUsecase = async (deps, params) => {
  // listIdが指定されている場合は所有者チェック
  if (params.listId !== null) {
    const fetched = await deps.getFilterListById(params.listId, params.userId);
    deps.validateListOwnership(fetched);
  }

  // 通知設定を更新
  await deps.upsertNotificationSettings(params.userId, params.listId);
};
