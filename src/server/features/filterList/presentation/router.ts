import { z } from "zod";
import { authenticatedProcedure, router } from "../../../../../trpc/init";
import { type NotificationSettingsDto, toFilterListDto } from "../application/dto/filterList.dto";
import { createFilterListUsecase } from "../application/usecases/createFilterList.usecase";
import { deleteFilterListUsecase } from "../application/usecases/deleteFilterList.usecase";
import { setNotificationTargetUsecase } from "../application/usecases/setNotificationTarget.usecase";
import { updateFilterListUsecase } from "../application/usecases/updateFilterList.usecase";
import { validateListCreation } from "../domain/services/validateListCreation.service";
import { validateListOwnership } from "../domain/services/validateListOwnership.service";
import { countFilterListsByUserId } from "../infrastructure/queryServices/countFilterListsByUserId";
import { getFilterListById } from "../infrastructure/queryServices/getFilterListById";
import { getFilterListsByUserId } from "../infrastructure/queryServices/getFilterListsByUserId";
import { getNotificationSettingsByUserId } from "../infrastructure/queryServices/getNotificationSettingsByUserId";
import { deleteFilterList } from "../infrastructure/repositories/deleteFilterList.repository";
import { insertFilterList } from "../infrastructure/repositories/insertFilterList.repository";
import { updateFilterList } from "../infrastructure/repositories/updateFilterList.repository";
import { upsertNotificationSettings } from "../infrastructure/repositories/upsertNotificationSettings.repository";

// プラン別リスト上限
const PLAN_LIST_LIMITS: Record<string, number> = {
  free: 1,
  standard: 3,
  pro: 10,
};

const getMaxListCount = (plan: string): number => {
  return PLAN_LIST_LIMITS[plan] ?? PLAN_LIST_LIMITS.free;
};

export const filterListRouter = router({
  /**
   * フィルターリスト一覧を取得
   */
  list: authenticatedProcedure.query(async ({ ctx }) => {
    const lists = await getFilterListsByUserId(ctx.user.id);
    return lists.map(toFilterListDto);
  }),

  /**
   * フィルターリストを作成
   */
  create: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        markets: z.array(z.string()).nullable().optional(),
        sectorCodes: z.array(z.string()).nullable().optional(),
        priceMin: z.number().int().positive().nullable().optional(),
        priceMax: z.number().int().positive().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: ユーザーのプランを取得
      const userPlan = "free";
      const maxListCount = getMaxListCount(userPlan);

      const entity = await createFilterListUsecase(
        { countFilterListsByUserId, insertFilterList, validateListCreation },
        {
          userId: ctx.user.id,
          name: input.name,
          markets: input.markets,
          sectorCodes: input.sectorCodes,
          priceMin: input.priceMin,
          priceMax: input.priceMax,
          maxListCount,
        },
      );

      return toFilterListDto(entity);
    }),

  /**
   * フィルターリストを更新
   */
  update: authenticatedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100),
        markets: z.array(z.string()).nullable().optional(),
        sectorCodes: z.array(z.string()).nullable().optional(),
        priceMin: z.number().int().positive().nullable().optional(),
        priceMax: z.number().int().positive().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const entity = await updateFilterListUsecase(
        { getFilterListById, updateFilterList, validateListOwnership },
        {
          id: input.id,
          userId: ctx.user.id,
          name: input.name,
          markets: input.markets,
          sectorCodes: input.sectorCodes,
          priceMin: input.priceMin,
          priceMax: input.priceMax,
        },
      );

      return toFilterListDto(entity);
    }),

  /**
   * フィルターリストを削除
   */
  delete: authenticatedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await deleteFilterListUsecase(
        {
          getFilterListById,
          getNotificationSettingsByUserId,
          deleteFilterList,
          upsertNotificationSettings,
          validateListOwnership,
        },
        {
          id: input.id,
          userId: ctx.user.id,
        },
      );

      return { success: true };
    }),

  /**
   * 通知対象リストを取得
   */
  getNotificationTarget: authenticatedProcedure.query(
    async ({ ctx }): Promise<NotificationSettingsDto> => {
      const settings = await getNotificationSettingsByUserId(ctx.user.id);
      return {
        notificationTargetListId: settings?.notificationTargetListId ?? null,
      };
    },
  ),

  /**
   * 通知対象リストを設定
   */
  setNotificationTarget: authenticatedProcedure
    .input(
      z.object({
        listId: z.string().uuid().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await setNotificationTargetUsecase(
        {
          getFilterListById,
          upsertNotificationSettings,
          validateListOwnership,
        },
        {
          userId: ctx.user.id,
          listId: input.listId,
        },
      );

      return { success: true };
    }),
});
