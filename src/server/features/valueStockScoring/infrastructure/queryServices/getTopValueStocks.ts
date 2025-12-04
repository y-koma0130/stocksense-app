/**
 * 上位割安株を取得するクエリサービス
 * ジョブから直接呼び出せるシンプルな関数
 */

import { getLatestMarketAnalysis } from "@/server/features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import type {
  LongTermValueStockDto,
  MidTermValueStockDto,
} from "../../application/dto/valueStock.dto";
import { getTopLongTermValueStocks } from "../../application/usecases/getTopLongTermValueStocks.usecase";
import { getTopMidTermValueStocks } from "../../application/usecases/getTopMidTermValueStocks.usecase";
import { getLatestLongTermIndicators, getLatestMidTermIndicators } from "./getIndicators";

type GetTopValueStocksParams = Readonly<{
  limit: number;
}>;

/**
 * 中期上位割安株を取得
 */
export const getTopMidTermStocks = async (
  params: GetTopValueStocksParams,
): Promise<MidTermValueStockDto[]> => {
  return await getTopMidTermValueStocks(
    { getLatestMidTermIndicators, getLatestMarketAnalysis },
    params,
  );
};

/**
 * 長期上位割安株を取得
 */
export const getTopLongTermStocks = async (
  params: GetTopValueStocksParams,
): Promise<LongTermValueStockDto[]> => {
  return await getTopLongTermValueStocks(
    { getLatestLongTermIndicators, getLatestMarketAnalysis },
    params,
  );
};
