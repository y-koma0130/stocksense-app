import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client";
import { monthlyStockScoring, weeklyStockScoring } from "../../../../inngest/functions";

/**
 * Inngest API endpoint for handling scheduled jobs
 * This endpoint is called by Inngest to execute scheduled functions
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    weeklyStockScoring, // Every Saturday 0:00 JST
    monthlyStockScoring, // Every 1st 0:00 JST
    // TODO: Monthly sector averages update (every 1st 14:00)
  ],
});
