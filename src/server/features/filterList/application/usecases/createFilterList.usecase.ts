import { createFilterList, type FilterListEntity } from "../../domain/entities/filterList";
import type { ValidateListCreation } from "../../domain/services/validateListCreation.service";
import type { CountFilterListsByUserId } from "../../infrastructure/queryServices/countFilterListsByUserId";
import type { InsertFilterList } from "../../infrastructure/repositories/insertFilterList.repository";

type Dependencies = Readonly<{
  countFilterListsByUserId: CountFilterListsByUserId;
  insertFilterList: InsertFilterList;
  validateListCreation: ValidateListCreation;
}>;

type Params = Readonly<{
  userId: string;
  name: string;
  markets?: string[] | null;
  sectorCodes?: string[] | null;
  priceMin?: number | null;
  priceMax?: number | null;
  maxListCount: number;
}>;

export type CreateFilterListUsecase = (
  deps: Dependencies,
  params: Params,
) => Promise<FilterListEntity>;

export const createFilterListUsecase: CreateFilterListUsecase = async (deps, params) => {
  // リスト数上限チェック
  const currentCount = await deps.countFilterListsByUserId(params.userId);
  deps.validateListCreation({
    currentListCount: currentCount,
    maxListCount: params.maxListCount,
  });

  // エンティティ生成
  const entity = createFilterList({
    userId: params.userId,
    name: params.name,
    markets: params.markets,
    sectorCodes: params.sectorCodes,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
  });

  // 保存
  await deps.insertFilterList(entity);

  return entity;
};
