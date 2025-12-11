/**
 * フィルターリストデータからFilterConditionsInputDtoに変換するヘルパー関数
 */

import type { FilterListDataDto } from "@/server/features/filterList/application/dto/filterList.dto";
import type { FilterConditionsInputDto } from "@/server/features/valueStockScoring/application/dto/filterConditionsInput.dto";

/**
 * フィルターリストからFilterConditionsInputDtoに変換
 */
export const toFilterConditions = (filterList: FilterListDataDto): FilterConditionsInputDto => {
  return {
    markets: filterList.markets && filterList.markets.length > 0 ? filterList.markets : null,
    sectorCodes:
      filterList.sectorCodes && filterList.sectorCodes.length > 0 ? filterList.sectorCodes : null,
    priceRange:
      filterList.priceMin !== null || filterList.priceMax !== null
        ? {
            min: filterList.priceMin,
            max: filterList.priceMax,
          }
        : null,
  };
};
