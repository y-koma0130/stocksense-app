/**
 * 分析対象銘柄を収集するユーティリティ
 * 全銘柄上位 + ユーザーフィルター上位の銘柄を重複なしで収集
 */

import { getAllNotificationSettingsWithFilterLists } from "@/server/features/filterList/infrastructure/queryServices/getAllNotificationSettingsWithFilterLists";
import type { FilterConditionsInputDto } from "@/server/features/valueStockScoring/application/dto/filterConditionsInput.dto";
import type {
  LongTermValueStockDto,
  MidTermValueStockDto,
} from "@/server/features/valueStockScoring/application/dto/valueStock.dto";
import {
  getTopLongTermStocks,
  getTopMidTermStocks,
} from "@/server/features/valueStockScoring/infrastructure/queryServices/getTopValueStocks";
import { toFilterConditions } from "./toFilterConditions";

// 各フィルターから取得する上位銘柄数
const STOCKS_PER_FILTER = 5;
// デフォルト（全銘柄）から取得する上位銘柄数
const DEFAULT_TOP_STOCKS = 5;

/**
 * 中期分析対象銘柄を収集
 */
export const collectMidTermAnalysisTargetStocks = async (): Promise<MidTermValueStockDto[]> => {
  const stockMap = new Map<string, MidTermValueStockDto>();

  // 1. 全銘柄から上位N銘柄を取得
  const defaultTopStocks = await getTopMidTermStocks({ limit: DEFAULT_TOP_STOCKS });
  for (const stock of defaultTopStocks) {
    stockMap.set(stock.stockId, stock);
  }

  // 2. フィルター設定を持つユーザーのフィルター条件を取得
  const notificationSettings = await getAllNotificationSettingsWithFilterLists();

  // 3. ユニークなフィルター条件でグループ化（同じ条件のフィルターは1回だけ実行）
  const filterConditionsMap = new Map<string, FilterConditionsInputDto>();
  for (const setting of notificationSettings) {
    const conditions = toFilterConditions(setting.filterList);
    const key = JSON.stringify(conditions);
    if (!filterConditionsMap.has(key)) {
      filterConditionsMap.set(key, conditions);
    }
  }

  // 4. 各フィルター条件で上位銘柄を取得して追加
  for (const conditions of filterConditionsMap.values()) {
    const filteredStocks = await getTopMidTermStocks({
      limit: STOCKS_PER_FILTER,
      filterConditions: conditions,
    });
    for (const stock of filteredStocks) {
      if (!stockMap.has(stock.stockId)) {
        stockMap.set(stock.stockId, stock);
      }
    }
  }

  return Array.from(stockMap.values());
};

/**
 * 長期分析対象銘柄を収集
 */
export const collectLongTermAnalysisTargetStocks = async (): Promise<LongTermValueStockDto[]> => {
  const stockMap = new Map<string, LongTermValueStockDto>();

  // 1. 全銘柄から上位N銘柄を取得
  const defaultTopStocks = await getTopLongTermStocks({ limit: DEFAULT_TOP_STOCKS });
  for (const stock of defaultTopStocks) {
    stockMap.set(stock.stockId, stock);
  }

  // 2. フィルター設定を持つユーザーのフィルター条件を取得
  const notificationSettings = await getAllNotificationSettingsWithFilterLists();

  // 3. ユニークなフィルター条件でグループ化（同じ条件のフィルターは1回だけ実行）
  const filterConditionsMap = new Map<string, FilterConditionsInputDto>();
  for (const setting of notificationSettings) {
    const conditions = toFilterConditions(setting.filterList);
    const key = JSON.stringify(conditions);
    if (!filterConditionsMap.has(key)) {
      filterConditionsMap.set(key, conditions);
    }
  }

  // 4. 各フィルター条件で上位銘柄を取得して追加
  for (const conditions of filterConditionsMap.values()) {
    const filteredStocks = await getTopLongTermStocks({
      limit: STOCKS_PER_FILTER,
      filterConditions: conditions,
    });
    for (const stock of filteredStocks) {
      if (!stockMap.has(stock.stockId)) {
        stockMap.set(stock.stockId, stock);
      }
    }
  }

  return Array.from(stockMap.values());
};
