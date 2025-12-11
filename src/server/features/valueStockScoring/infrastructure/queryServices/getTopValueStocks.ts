/**
 * 上位割安株を取得するクエリサービス
 * ジョブから直接呼び出せるシンプルな関数
 */

import { getLatestMarketAnalysis } from "@/server/features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import type { FilterConditionsInputDto } from "../../application/dto/filterConditionsInput.dto";
import type {
  LongTermValueStockDto,
  MidTermValueStockDto,
} from "../../application/dto/valueStock.dto";
import { getTopLongTermValueStocks } from "../../application/usecases/getTopLongTermValueStocks.usecase";
import { getTopMidTermValueStocks } from "../../application/usecases/getTopMidTermValueStocks.usecase";
import { calculateLongTermValueStockScore } from "../../domain/services/calculateLongTermValueStockScore.service";
import { calculateMidTermValueStockScore } from "../../domain/services/calculateMidTermValueStockScore.service";
import { filterProMarket } from "../../domain/services/filterProMarket.service";
import { isTrapStock } from "../../domain/services/isTrapStock.service";
import { rankByScore } from "../../domain/services/rankByScore.service";
import { getLatestLongTermIndicators, getLatestMidTermIndicators } from "./getIndicators";

type GetTopValueStocksParams = Readonly<{
  limit: number;
  filterConditions?: FilterConditionsInputDto;
}>;

/**
 * 中期上位割安株を取得
 */
export const getTopMidTermStocks = async (
  params: GetTopValueStocksParams,
): Promise<MidTermValueStockDto[]> => {
  return await getTopMidTermValueStocks(
    {
      getLatestMidTermIndicators,
      getLatestMarketAnalysis,
      calculateMidTermValueStockScore,
      filterProMarket,
      isTrapStock,
      rankByScore,
    },
    {
      limit: params.limit,
      filterConditions: params.filterConditions,
    },
  );
};

/**
 * 長期上位割安株を取得
 */
export const getTopLongTermStocks = async (
  params: GetTopValueStocksParams,
): Promise<LongTermValueStockDto[]> => {
  return await getTopLongTermValueStocks(
    {
      getLatestLongTermIndicators,
      getLatestMarketAnalysis,
      calculateLongTermValueStockScore,
      filterProMarket,
      isTrapStock,
      rankByScore,
    },
    {
      limit: params.limit,
      filterConditions: params.filterConditions,
    },
  );
};
