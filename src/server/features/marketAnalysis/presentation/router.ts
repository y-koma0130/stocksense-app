import { z } from "zod";
import { publicProcedure, router } from "../../../../../trpc/init";
import { PeriodTypeSchema } from "../domain/values/types";
import { getLatestMarketAnalysis } from "../infrastructure/queryServices/getLatestMarketAnalysis";

export const marketAnalysisRouter = router({
  /**
   * 最新のマーケット分析を取得
   */
  getLatestAnalysis: publicProcedure
    .input(
      z.object({
        periodType: PeriodTypeSchema,
      }),
    )
    .query(async ({ input }) => {
      return await getLatestMarketAnalysis({
        periodType: input.periodType,
      });
    }),
});
