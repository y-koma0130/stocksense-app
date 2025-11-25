import { z } from "zod";

/**
 * LINEユーザー集約エンティティのZodスキーマ
 * TODO: 値オブジェクトの実装
 */
export const lineUserSchema = z.object({
  lineUserId: z.string().min(1),
  userId: z.string().nullable(),
  displayName: z.string().nullable(),
  notificationEnabled: z.boolean(),
});

/**
 * LINEユーザー集約エンティティ型
 */
export type LineUserEntity = z.infer<typeof lineUserSchema>;

/**
 * LINEユーザー集約エンティティの生成パラメータ
 */
export type CreateLineUserParams = {
  lineUserId: string;
  userId?: string | null;
  displayName: string | null;
  notificationEnabled?: boolean;
};

/**
 * LINEユーザー集約エンティティを生成する
 */
export const createLineUser = (params: CreateLineUserParams): LineUserEntity => {
  return lineUserSchema.parse({
    lineUserId: params.lineUserId,
    userId: params.userId ?? null,
    displayName: params.displayName,
    notificationEnabled: params.notificationEnabled ?? true,
  });
};
