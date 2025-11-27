import { z } from "zod";
import { periodTypeSchema } from "@/constants/periodTypes";
import { publicProcedure, router } from "../../../../../trpc/init";
import { getStockAnalysisByStockId } from "../infrastructure/queryServices/getStockAnalysisByStockId";
import { toStockAnalysisDto } from "../application/dto/stockAnalysis.dto";

export const stockAnalysisRouter = router({
  /**
   * stockIdとperiodTypeで個別株分析を取得
   */
  getStockAnalysis: publicProcedure
    .input(
      z.object({
        stockId: z.string().uuid(),
        periodType: periodTypeSchema,
      }),
    )
    .query(async ({ input }) => {
      const analysis = await getStockAnalysisByStockId({
        stockId: input.stockId,
        periodType: input.periodType,
      });

      if (!analysis) {
        return null;
      }

      return toStockAnalysisDto(analysis);
    }),

  /**
   * 複数銘柄の解析状況を一括取得
   */
  getBulkAnalysisStatus: publicProcedure
    .input(
      z.object({
        stockIds: z.array(z.string().uuid()),
        periodType: periodTypeSchema,
      }),
    )
    .query(async ({ input }) => {
      const { stockIds, periodType } = input;

      // 各銘柄の解析状況を並列取得
      const results = await Promise.all(
        stockIds.map(async (stockId) => {
          const analysis = await getStockAnalysisByStockId({
            stockId,
            periodType,
          });

          return {
            stockId,
            hasAnalysis: analysis !== null,
          };
        }),
      );

      return results;
    }),
});
