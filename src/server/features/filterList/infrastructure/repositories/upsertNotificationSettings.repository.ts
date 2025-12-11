import { db } from "@/db";
import { userNotificationSettings } from "@/db/schema";
import { nowJST } from "@/lib/datetime/jst";

/**
 * 通知設定をUPSERTする
 */
export type UpsertNotificationSettings = (
  userId: string,
  notificationTargetListId: string | null,
) => Promise<void>;

export const upsertNotificationSettings: UpsertNotificationSettings = async (
  userId,
  notificationTargetListId,
) => {
  await db
    .insert(userNotificationSettings)
    .values({
      userId,
      notificationTargetListId,
      updatedAt: nowJST(),
    })
    .onConflictDoUpdate({
      target: userNotificationSettings.userId,
      set: {
        notificationTargetListId,
        updatedAt: nowJST(),
      },
    });
};
