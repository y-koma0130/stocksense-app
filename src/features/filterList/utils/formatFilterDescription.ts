import type { FilterConditions } from "../types/filterList";

/**
 * フィルター条件を説明文に変換
 */
export const formatFilterDescription = (conditions: FilterConditions): string => {
  const parts: string[] = [];

  if (conditions.markets && conditions.markets.length > 0) {
    parts.push(`市場: ${conditions.markets.join(", ")}`);
  }

  if (conditions.sectorCodes && conditions.sectorCodes.length > 0) {
    parts.push(`業種: ${conditions.sectorCodes.length}件`);
  }

  if (conditions.priceRange !== null) {
    const min = conditions.priceRange.min ?? 0;
    const max = conditions.priceRange.max;
    const maxStr = max !== null ? max.toLocaleString() : "上限なし";
    parts.push(`価格: ${min.toLocaleString()}〜${maxStr}円`);
  }

  return parts.length > 0 ? parts.join(" / ") : "フィルターなし";
};
