import { z } from "zod";
import { filterConditionsSchema } from "../values/filterConditions";

/**
 * フィルターリスト集約エンティティのZodスキーマ
 */
export const filterListSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  markets: filterConditionsSchema.shape.markets,
  sectorCodes: filterConditionsSchema.shape.sectorCodes,
  priceMin: filterConditionsSchema.shape.priceMin,
  priceMax: filterConditionsSchema.shape.priceMax,
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * フィルターリスト集約エンティティ型
 */
export type FilterListEntity = z.infer<typeof filterListSchema>;

/**
 * フィルターリスト生成パラメータ
 */
export type CreateFilterListParams = Readonly<{
  id?: string;
  userId: string;
  name: string;
  markets?: string[] | null;
  sectorCodes?: string[] | null;
  priceMin?: number | null;
  priceMax?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}>;

/**
 * フィルターリスト集約エンティティを生成する
 */
export const createFilterList = (params: CreateFilterListParams): FilterListEntity => {
  const now = new Date();
  return filterListSchema.parse({
    id: params.id ?? crypto.randomUUID(),
    userId: params.userId,
    name: params.name,
    markets: params.markets ?? null,
    sectorCodes: params.sectorCodes ?? null,
    priceMin: params.priceMin ?? null,
    priceMax: params.priceMax ?? null,
    createdAt: params.createdAt ?? now,
    updatedAt: params.updatedAt ?? now,
  });
};
