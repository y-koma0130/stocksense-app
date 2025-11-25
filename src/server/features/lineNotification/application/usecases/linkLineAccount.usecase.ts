import { createLineUser } from "../../domain/entities/lineUser";
import type { GetLineUserByLineUserId } from "../../infrastructure/queryServices/getLineUserByLineUserId";
import type { UpsertLineUser } from "../../infrastructure/repositories/upsertLineUser.repository";

type Dependencies = Readonly<{
  getLineUserByLineUserId: GetLineUserByLineUserId;
  upsertLineUser: UpsertLineUser;
}>;

type Params = Readonly<{
  lineUserId: string;
  supabaseUserId: string;
}>;

/**
 * LINE連携アカウント紐付けユースケースの型定義
 */
export type LinkLineAccountUsecase = (
  dependencies: Dependencies,
  params: Params,
) => Promise<{ success: boolean }>;

export const linkLineAccountUsecase: LinkLineAccountUsecase = async (dependencies, params) => {
  console.log("[linkLineAccount] Starting with params:", params);

  // クエリサービスで既存データを取得
  const existingRecord = await dependencies.getLineUserByLineUserId(params.lineUserId);
  console.log("[linkLineAccount] Existing record:", existingRecord);

  if (!existingRecord) {
    console.error("[linkLineAccount] LINE連携が見つかりません");
    throw new Error("LINE連携が見つかりません");
  }

  // すでに別のユーザーに紐付いている場合はエラー
  if (existingRecord.userId && existingRecord.userId !== params.supabaseUserId) {
    console.error("[linkLineAccount] Already linked to different user");
    throw new Error("このLINEアカウントは既に別のユーザーに紐付けられています");
  }

  // 新しい状態でエンティティを再生成
  const updatedEntity = createLineUser({
    lineUserId: existingRecord.lineUserId,
    userId: params.supabaseUserId,
    displayName: existingRecord.displayName,
    notificationEnabled: existingRecord.notificationEnabled,
  });
  console.log("[linkLineAccount] Updated entity:", updatedEntity);

  // エンティティを丸ごとupsert
  await dependencies.upsertLineUser(updatedEntity);
  console.log("[linkLineAccount] Upsert completed successfully");

  return { success: true };
};
