import { z } from "zod";
import { subscriptionPlanSchema } from "@/constants/subscriptionPlans";

/**
 * ユーザーサブスクリプション集約エンティティのZodスキーマ
 */
export const userSubscriptionSchema = z.object({
  id: z.uuid().optional(),
  userId: z.uuid(),
  plan: subscriptionPlanSchema,
  planStartedAt: z.date(),
  planExpiresAt: z.date().nullable(),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
});

/**
 * ユーザーサブスクリプション集約エンティティ型
 */
export type UserSubscriptionEntity = z.infer<typeof userSubscriptionSchema>;

/**
 * ユーザーサブスクリプション生成パラメータ
 */
export type CreateUserSubscriptionParams = {
  userId: string;
  plan?: "free" | "standard" | "pro";
  planStartedAt?: Date;
  planExpiresAt?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

/**
 * ユーザーサブスクリプション集約エンティティを生成する
 * 新規登録時はfreeプランで初期化
 */
export const createUserSubscription = (
  params: CreateUserSubscriptionParams,
): UserSubscriptionEntity => {
  return userSubscriptionSchema.parse({
    userId: params.userId,
    plan: params.plan ?? "free",
    planStartedAt: params.planStartedAt ?? new Date(),
    planExpiresAt: params.planExpiresAt ?? null,
    stripeCustomerId: params.stripeCustomerId ?? null,
    stripeSubscriptionId: params.stripeSubscriptionId ?? null,
  });
};
