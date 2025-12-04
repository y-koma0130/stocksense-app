import { z } from "zod";
import { PERIOD_TYPES, periodTypeSchema } from "@/constants/periodTypes";
import { getLatestMarketAnalysis } from "@/server/features/marketAnalysis/infrastructure/queryServices/getLatestMarketAnalysis";
import { publicProcedure, router } from "../../../../../trpc/init";
import { getTopLongTermValueStocks } from "../application/usecases/getTopLongTermValueStocks.usecase";
import { getTopMidTermValueStocks } from "../application/usecases/getTopMidTermValueStocks.usecase";
import {
  getLatestLongTermIndicators,
  getLatestMidTermIndicators,
} from "../infrastructure/queryServices/getIndicators";

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
      }),
    )
    .query(async ({ input }) => {
      if (input.periodType === PERIOD_TYPES.MID_TERM) {
        return await getTopMidTermValueStocks(
          { getLatestMidTermIndicators, getLatestMarketAnalysis },
          { limit: input.limit },
        );
      } else {
        return await getTopLongTermValueStocks(
          { getLatestLongTermIndicators, getLatestMarketAnalysis },
          { limit: input.limit },
        );
      }
    }),
});
