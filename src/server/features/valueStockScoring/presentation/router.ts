import { z } from "zod";
import { PERIOD_TYPES, periodTypeSchema } from "@/constants/periodTypes";
import { getLatestMarketAnalysis } from "@/server/features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import { publicProcedure, router } from "../../../../../trpc/init";
import { getTopLongTermValueStocks } from "../application/usecases/getTopLongTermValueStocks.usecase";
import { getTopMidTermValueStocks } from "../application/usecases/getTopMidTermValueStocks.usecase";
import { calculateLongTermValueStockScore } from "../domain/services/calculateLongTermValueStockScore.service";
import { calculateMidTermValueStockScore } from "../domain/services/calculateMidTermValueStockScore.service";
import { filterProMarket } from "../domain/services/filterProMarket.service";
import { isTrapStock } from "../domain/services/isTrapStock.service";
import { rankByScore } from "../domain/services/rankByScore.service";
import {
  getLatestLongTermIndicators,
  getLatestMidTermIndicators,
} from "../infrastructure/queryServices/getIndicators";
import { filterConditionsRequestSchema } from "./requests/filterConditionsRequest";

export const valueStockScoringRouter = router({
  /**
   * 上位割安株を取得
   * periodTypeに応じて中期/長期のユースケースを呼び分ける
   */
  getTopValueStocks: publicProcedure
    .input(
      z.object({
        periodType: periodTypeSchema,
        limit: z.number().min(1).max(100).optional().default(20),
        filterConditions: filterConditionsRequestSchema.optional(),
      }),
    )
    .query(async ({ input }) => {
      if (input.periodType === PERIOD_TYPES.MID_TERM) {
        return await getTopMidTermValueStocks(
          {
            getLatestMidTermIndicators,
            getLatestMarketAnalysis,
            calculateMidTermValueStockScore,
            filterProMarket,
            isTrapStock,
            rankByScore,
          },
          { limit: input.limit, filterConditions: input.filterConditions },
        );
      } else {
        return await getTopLongTermValueStocks(
          {
            getLatestLongTermIndicators,
            getLatestMarketAnalysis,
            calculateLongTermValueStockScore,
            filterProMarket,
            isTrapStock,
            rankByScore,
          },
          { limit: input.limit, filterConditions: input.filterConditions },
        );
      }
    }),
});
