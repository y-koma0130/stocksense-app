import type { IndicatorDto } from "../../application/dto/indicator.dto";
import { isTrapStock } from "./isTrapStock.service";

/**
 * 罠銘柄フィルタリング関数の型定義
 */
export type FilterTrapStocks = <T extends IndicatorDto>(indicators: readonly T[]) => T[];

/**
 * 罠銘柄を除外する
 * 財務健全性が低い銘柄を除外して安全な投資対象のみを返す
 */
export const filterTrapStocks: FilterTrapStocks = (indicators) => {
  return indicators.filter((indicator) => !isTrapStock(indicator).isTrap);
};
