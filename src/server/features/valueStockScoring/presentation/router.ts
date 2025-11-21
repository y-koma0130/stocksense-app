import { z } from "zod";
import { publicProcedure, router } from "../../../../../trpc/init";
import { getTopStockScores } from "../infrastructure/queryServices/getTopStockScores";

export const valueStockScoringRouter = router({
  getTopScores: publicProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(100).default(20),
        scoreType: z.enum(["mid_term", "long_term"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      return await getTopStockScores({
        limit: input.limit,
        scoreType: input.scoreType,
      });
    }),
});
