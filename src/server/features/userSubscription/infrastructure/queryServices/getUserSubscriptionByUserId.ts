import { eq } from "drizzle-orm";
import type { SubscriptionPlan } from "@/constants/subscriptionPlans";
import { db } from "@/db";
import { userSubscriptions } from "@/db/schema";

/**
 * クエリサービスから返却するDTO型
 */
export type UserSubscriptionDto = Readonly<{
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  planStartedAt: Date;
  planExpiresAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}>;

/**
 * ユーザーIDでサブスクリプションを取得する関数の型定義
 */
export type GetUserSubscriptionByUserId = (userId: string) => Promise<UserSubscriptionDto | null>;

/**
 * ユーザーIDでサブスクリプションを取得
 */
export const getUserSubscriptionByUserId: GetUserSubscriptionByUserId = async (userId) => {
  const result = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id,
    userId: row.userId,
    plan: row.plan as SubscriptionPlan,
    planStartedAt: row.planStartedAt,
    planExpiresAt: row.planExpiresAt,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
  };
};
