import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userNotificationSettings } from "@/db/schema";

export type NotificationSettingsRecord = Readonly<{
  userId: string;
  notificationTargetListId: string | null;
}>;

/**
 * ユーザーIDから通知設定を取得
 */
export type GetNotificationSettingsByUserId = (
  userId: string,
) => Promise<NotificationSettingsRecord | null>;

export const getNotificationSettingsByUserId: GetNotificationSettingsByUserId = async (userId) => {
  const result = await db
    .select()
    .from(userNotificationSettings)
    .where(eq(userNotificationSettings.userId, userId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    userId: result[0].userId,
    notificationTargetListId: result[0].notificationTargetListId,
  };
};
