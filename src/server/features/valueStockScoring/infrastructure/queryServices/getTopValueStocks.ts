/**
 * 上位割安株を取得するクエリサービス
 * ジョブから直接呼び出せるシンプルな関数
 */

import type { PeriodType } from "@/constants/periodTypes";
import type { ValueStockDto } from "../../application/dto/valueStock.dto";
import { getTopValueStocks as getTopValueStocksUsecase } from "../../application/usecases/getTopValueStocks.usecase";
import { getLatestIndicators } from "./getIndicators";

type GetTopValueStocksParams = Readonly<{
  periodType: PeriodType;
  limit: number;
}>;

/**
 * 上位割安株を取得
 */
export const getTopValueStocks = async (
  params: GetTopValueStocksParams,
): Promise<ValueStockDto[]> => {
  return await getTopValueStocksUsecase({ getLatestIndicators }, params);
};
