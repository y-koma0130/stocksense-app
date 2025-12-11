import { createFilterList, type FilterListEntity } from "../../domain/entities/filterList";
import type { ValidateListOwnership } from "../../domain/services/validateListOwnership.service";
import type { GetFilterListById } from "../../infrastructure/queryServices/getFilterListById";
import type { UpdateFilterList } from "../../infrastructure/repositories/updateFilterList.repository";

type Dependencies = Readonly<{
  getFilterListById: GetFilterListById;
  updateFilterList: UpdateFilterList;
  validateListOwnership: ValidateListOwnership;
}>;

type Params = Readonly<{
  id: string;
  userId: string;
  name: string;
  markets?: string[] | null;
  sectorCodes?: string[] | null;
  priceMin?: number | null;
  priceMax?: number | null;
}>;

export type UpdateFilterListUsecase = (
  deps: Dependencies,
  params: Params,
) => Promise<FilterListEntity>;

export const updateFilterListUsecase: UpdateFilterListUsecase = async (deps, params) => {
  // 既存レコード取得・所有者チェック
  const fetched = await deps.getFilterListById(params.id, params.userId);
  const existing = deps.validateListOwnership(fetched);

  // エンティティ再生成
  const entity = createFilterList({
    id: existing.id,
    userId: existing.userId,
    name: params.name,
    markets: params.markets,
    sectorCodes: params.sectorCodes,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    createdAt: existing.createdAt,
  });

  // 更新
  await deps.updateFilterList(entity);

  return entity;
};
