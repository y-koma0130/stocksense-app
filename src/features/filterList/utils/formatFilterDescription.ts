import type { FilterConditions } from "../types/filterList";

/**
 * フィルター条件を説明文に変換
 */
export const formatFilterDescription = (conditions: FilterConditions): string => {
  const parts: string[] = [];

  if (conditions.markets?.length) {
    parts.push(`市場: ${conditions.markets.join(", ")}`);
  }

  if (conditions.sectorCodes?.length) {
    parts.push(`業種: ${conditions.sectorCodes.length}件`);
  }

  if (conditions.priceRange?.min !== undefined || conditions.priceRange?.max !== undefined) {
    const min = conditions.priceRange?.min ?? 0;
    const max = conditions.priceRange?.max ?? "上限なし";
    parts.push(
      `価格: ${min.toLocaleString()}〜${typeof max === "number" ? max.toLocaleString() : max}円`,
    );
  }

  return parts.length > 0 ? parts.join(" / ") : "フィルターなし";
};
