import { z } from "zod";
import { periodTypeSchema } from "@/constants/periodTypes";
import { publicProcedure, router } from "../../../../../trpc/init";
import { getTopValueStocks } from "../application/usecases/getTopValueStocks.usecase";
import { getLatestIndicators } from "../infrastructure/queryServices/getIndicators";

export const valueStockScoringRouter = router({
  /**
   * 上位割安株を取得
   * ドメインサービスでスコア計算し、スコア順にソートして返却
   */
  getTopValueStocks: publicProcedure
    .input(
      z.object({
        periodType: periodTypeSchema,
        limit: z.number().min(1).max(100).optional().default(20),
      }),
    )
    .query(async ({ input }) => {
      const stocks = await getTopValueStocks(
        { getLatestIndicators },
        { periodType: input.periodType, limit: input.limit },
      );
      return stocks;
    }),
});
