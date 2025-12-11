import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { stockMacroTags, stockThemeTags } from "@/db/schema";

/**
 * タグフィルタ条件
 * マイリストのFilterConditionsInputDtoとは別に、内部でタグフィルタを使用する場合の型
 */
type TagFilterConditions = Readonly<{
  macroTagIds?: string[];
  themeTagIds?: string[];
}>;

/**
 * フィルタ条件に基づいてタグで絞り込んだ銘柄IDを取得する関数の型定義
 */
export type GetFilteredStockIdsByTags = (
  filterConditions?: TagFilterConditions,
) => Promise<string[] | null>;

/**
 * フィルタ条件に基づいてタグで絞り込んだ銘柄IDを取得
 * タグ条件がない場合はnullを返す（フィルタリング不要）
 * 複数のタグ条件がある場合はOR（和集合）で結合
 */
export const getFilteredStockIdsByTags: GetFilteredStockIdsByTags = async (filterConditions) => {
  if (!filterConditions?.macroTagIds?.length && !filterConditions?.themeTagIds?.length) {
    return null;
  }

  const stockIdSets: Set<string>[] = [];

  if (filterConditions.macroTagIds?.length) {
    const macroTagStocks = await db
      .select({ stockId: stockMacroTags.stockId })
      .from(stockMacroTags)
      .where(inArray(stockMacroTags.macroTagId, filterConditions.macroTagIds));
    stockIdSets.push(new Set(macroTagStocks.map((row) => row.stockId)));
  }

  if (filterConditions.themeTagIds?.length) {
    const themeTagStocks = await db
      .select({ stockId: stockThemeTags.stockId })
      .from(stockThemeTags)
      .where(inArray(stockThemeTags.themeTagId, filterConditions.themeTagIds));
    stockIdSets.push(new Set(themeTagStocks.map((row) => row.stockId)));
  }

  if (stockIdSets.length === 0) {
    return null;
  }

  const unionSet = new Set<string>();
  for (const set of stockIdSets) {
    for (const id of set) {
      unionSet.add(id);
    }
  }

  return Array.from(unionSet);
};
