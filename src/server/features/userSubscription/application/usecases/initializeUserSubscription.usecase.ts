import type { SubscriptionPlan } from "@/constants/subscriptionPlans";
import { createUserSubscription } from "../../domain/entities/userSubscription";
import type { GetUserSubscriptionByUserId } from "../../infrastructure/queryServices/getUserSubscriptionByUserId";
import type { InsertUserSubscription } from "../../infrastructure/repositories/insertUserSubscription.repository";

type Dependencies = Readonly<{
  getUserSubscriptionByUserId: GetUserSubscriptionByUserId;
  insertUserSubscription: InsertUserSubscription;
}>;

type Params = Readonly<{
  userId: string;
}>;

type Result = Readonly<{
  isNewUser: boolean;
  plan: SubscriptionPlan;
}>;

/**
 * ユーザーサブスクリプション初期化ユースケースの型定義
 */
export type InitializeUserSubscriptionUsecase = (
  dependencies: Dependencies,
  params: Params,
) => Promise<Result>;

/**
 * ユーザーサブスクリプションを初期化する
 * - 既存レコードがある場合: 何もせず既存のプランを返す（冪等）
 * - 既存レコードがない場合: freeプランで新規作成
 */
export const initializeUserSubscriptionUsecase: InitializeUserSubscriptionUsecase = async (
  dependencies,
  params,
) => {
  // 既存レコードを確認
  const existing = await dependencies.getUserSubscriptionByUserId(params.userId);

  if (existing) {
    // 既存レコードがある場合は何もせず返す（冪等）
    return {
      isNewUser: false,
      plan: existing.plan,
    };
  }

  // 新規ユーザーの場合はfreeプランでエンティティを生成
  const entity = createUserSubscription({
    userId: params.userId,
    plan: "free",
  });

  // DBに登録
  await dependencies.insertUserSubscription(entity);

  return {
    isNewUser: true,
    plan: entity.plan,
  };
};
