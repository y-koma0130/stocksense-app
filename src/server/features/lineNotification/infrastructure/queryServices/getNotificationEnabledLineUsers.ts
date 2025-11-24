import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lineUsers } from "@/db/schema";
import type { LineUserDto } from "../../application/dto/lineUserDto";

/**
 * 通知が有効なLINEユーザーを取得する関数の型定義
 */
export type GetNotificationEnabledLineUsers = () => Promise<LineUserDto[]>;

export const getNotificationEnabledLineUsers: GetNotificationEnabledLineUsers = async () => {
  const users = await db
    .select({
      lineUserId: lineUsers.lineUserId,
      displayName: lineUsers.displayName,
    })
    .from(lineUsers)
    .where(eq(lineUsers.notificationEnabled, 1));

  return users;
};
