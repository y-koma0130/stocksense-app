import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lineUsers } from "@/db/schema";

type LineUserRecord = {
  lineUserId: string;
  userId: string | null;
  displayName: string | null;
  notificationEnabled: boolean;
};

/**
 * LINE User IDからLINEユーザー情報を取得
 */
export type GetLineUserByLineUserId = (lineUserId: string) => Promise<LineUserRecord | null>;

export const getLineUserByLineUserId: GetLineUserByLineUserId = async (lineUserId) => {
  const result = await db
    .select({
      lineUserId: lineUsers.lineUserId,
      userId: lineUsers.userId,
      displayName: lineUsers.displayName,
      notificationEnabled: lineUsers.notificationEnabled,
    })
    .from(lineUsers)
    .where(eq(lineUsers.lineUserId, lineUserId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    lineUserId: result[0].lineUserId,
    userId: result[0].userId,
    displayName: result[0].displayName,
    notificationEnabled: result[0].notificationEnabled === 1,
  };
};
