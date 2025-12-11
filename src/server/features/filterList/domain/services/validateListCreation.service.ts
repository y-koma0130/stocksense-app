import { TRPCError } from "@trpc/server";

/**
 * フィルターリスト作成のドメインバリデーション
 * プラン別のリスト数上限をチェックする
 */
export type ValidateListCreation = (params: {
  currentListCount: number;
  maxListCount: number;
}) => void;

export const validateListCreation: ValidateListCreation = (params) => {
  if (params.currentListCount >= params.maxListCount) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `リスト数の上限（${params.maxListCount}件）に達しています`,
    });
  }
};
