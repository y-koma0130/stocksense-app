import { db } from "@/db";
import { userSubscriptions } from "@/db/schema";
import type { UserSubscriptionEntity } from "../../domain/entities/userSubscription";

/**
 * ユーザーサブスクリプションをINSERTする関数の型定義
 */
export type InsertUserSubscription = (entity: UserSubscriptionEntity) => Promise<void>;

/**
 * ユーザーサブスクリプションを新規登録
 * 既存レコードがある場合はUNIQUE制約違反でエラーになる
 */
export const insertUserSubscription: InsertUserSubscription = async (entity) => {
  await db.insert(userSubscriptions).values({
    userId: entity.userId,
    plan: entity.plan,
    planStartedAt: entity.planStartedAt,
    planExpiresAt: entity.planExpiresAt,
    stripeCustomerId: entity.stripeCustomerId,
    stripeSubscriptionId: entity.stripeSubscriptionId,
  });
};
