import { z } from "zod";
import { authenticatedProcedure, router } from "../../../../../trpc/init";
import { linkLineAccountUsecase } from "../application/usecases/linkLineAccount.usecase";
import { updateNotificationEnabledUsecase } from "../application/usecases/updateNotificationEnabled.usecase";
import { validateNotificationUpdate } from "../domain/services/validateNotificationUpdate.service";
import { getLineUserByLineUserId } from "../infrastructure/queryServices/getLineUserByLineUserId";
import { getLineUserByUserId } from "../infrastructure/queryServices/getLineUserByUserId";
import { upsertLineUser } from "../infrastructure/repositories/upsertLineUser.repository";

export const lineNotificationRouter = router({
  /**
   * 現在のユーザーのLINE連携設定を取得
   * router -> クエリサービスで取得して返却
   */
  getSettings: authenticatedProcedure.query(async ({ ctx }) => {
    const lineUser = await getLineUserByUserId(ctx.user.id);
    if (!lineUser) {
      return null;
    }
    return {
      lineUserId: lineUser.lineUserId,
      displayName: lineUser.displayName,
      notificationEnabled: lineUser.notificationEnabled,
    };
  }),

  /**
   * 通知設定のON/OFFを更新
   * router -> ユースケース (クエリサービスで取得 → ドメインサービスでバリデーション → エンティティ再生成) -> リポジトリでupsert
   */
  updateNotificationEnabled: authenticatedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return updateNotificationEnabledUsecase(
        { getLineUserByUserId, upsertLineUser, validateNotificationUpdate },
        { userId: ctx.user.id, enabled: input.enabled },
      );
    }),

  /**
   * LINE連携ユーザーとSupabaseユーザーを紐付ける（認証後のコールバックから呼び出し）
   * router -> ユースケース (クエリサービスで取得 → エンティティ再生成) -> リポジトリでupsert
   */
  linkLineAccount: authenticatedProcedure
    .input(
      z.object({
        lineUserId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return linkLineAccountUsecase(
        { getLineUserByLineUserId, upsertLineUser },
        { lineUserId: input.lineUserId, supabaseUserId: ctx.user.id },
      );
    }),
});
