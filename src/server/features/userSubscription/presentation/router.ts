import { authenticatedProcedure, router } from "../../../../../trpc/init";
import { initializeUserSubscriptionUsecase } from "../application/usecases/initializeUserSubscription.usecase";
import { getUserSubscriptionByUserId } from "../infrastructure/queryServices/getUserSubscriptionByUserId";
import { insertUserSubscription } from "../infrastructure/repositories/insertUserSubscription.repository";

export const userSubscriptionRouter = router({
  /**
   * 現在のユーザーのサブスクリプション情報を取得
   * router -> クエリサービスで取得して返却
   */
  getMySubscription: authenticatedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserSubscriptionByUserId(ctx.user.id);
    if (!subscription) {
      return null;
    }
    return {
      plan: subscription.plan,
      planStartedAt: subscription.planStartedAt,
      planExpiresAt: subscription.planExpiresAt,
    };
  }),

  /**
   * ユーザーサブスクリプションを初期化（新規登録時）
   * router -> ユースケース (クエリサービスで既存確認 → エンティティ生成 → リポジトリでINSERT)
   * 冪等: 既存レコードがあれば何もしない
   */
  initialize: authenticatedProcedure.mutation(async ({ ctx }) => {
    return initializeUserSubscriptionUsecase(
      { getUserSubscriptionByUserId, insertUserSubscription },
      { userId: ctx.user.id },
    );
  }),
});
