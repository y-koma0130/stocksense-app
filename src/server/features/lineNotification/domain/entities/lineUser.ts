import { z } from "zod";

/**
 * LINEユーザー集約エンティティのZodスキーマ
 * TODO: lineUserIdは値オブジェクトとして切り出す
 */
export const lineUserSchema = z.object({
  lineUserId: z.string().min(1),
  displayName: z.string().nullable(),
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
  displayName: string | null;
};

/**
 * LINEユーザー集約エンティティを生成する
 */
export const createLineUser = (params: CreateLineUserParams): LineUserEntity => {
  return lineUserSchema.parse({
    lineUserId: params.lineUserId,
    displayName: params.displayName,
  });
};
