import { TRPCError } from "@trpc/server";
import type { FilterListEntity } from "../entities/filterList";

/**
 * フィルターリストの所有者バリデーション
 * リストが存在し、リクエストユーザーが所有者であることを確認する
 */
export type ValidateListOwnership = (list: FilterListEntity | null) => FilterListEntity;

export const validateListOwnership: ValidateListOwnership = (list) => {
  if (!list) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "リストが見つかりません",
    });
  }
  return list;
};
