/**
 * 通知設定更新のドメインバリデーション
 * LINE連携が完了しているユーザーのみ通知設定を変更できる
 */
export type ValidateNotificationUpdate = (params: {
  lineUserId: string;
  userId: string | null;
  requestUserId: string;
}) => void;

export const validateNotificationUpdate: ValidateNotificationUpdate = (params) => {
  // LINE連携が完了しているか確認
  if (!params.userId) {
    throw new Error("LINE連携が完了していません");
  }

  // 本人確認: リクエストしたユーザーとLINE連携されているユーザーが一致するか
  if (params.userId !== params.requestUserId) {
    throw new Error("他のユーザーの通知設定は変更できません");
  }
};
