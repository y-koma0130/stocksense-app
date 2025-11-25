import { createLineUser } from "../../domain/entities/lineUser";
import type { GetLineUserByUserId } from "../../infrastructure/queryServices/getLineUserByUserId";
import type { UpsertLineUser } from "../../infrastructure/repositories/upsertLineUser.repository";

type Dependencies = Readonly<{
  getLineUserByUserId: GetLineUserByUserId;
  upsertLineUser: UpsertLineUser;
}>;

type Params = Readonly<{
  userId: string;
  enabled: boolean;
}>;

export type UpdateNotificationEnabledUsecase = (
  dependencies: Dependencies,
  params: Params,
) => Promise<{ success: boolean }>;

export const updateNotificationEnabledUsecase: UpdateNotificationEnabledUsecase = async (
  dependencies,
  params,
) => {
  // クエリサービスで既存データを取得
  const existingRecord = await dependencies.getLineUserByUserId(params.userId);

  if (!existingRecord) {
    throw new Error("LINE連携が完了していません");
  }

  // 新しい状態でエンティティを再生成
  const updatedEntity = createLineUser({
    lineUserId: existingRecord.lineUserId,
    userId: existingRecord.userId,
    displayName: existingRecord.displayName,
    notificationEnabled: params.enabled,
  });

  // エンティティを丸ごとupsert
  await dependencies.upsertLineUser(updatedEntity);

  return { success: true };
};
