import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client";
import { monthlySectorAveragesUpdate } from "../../../server/jobs/monthlySectorAveragesUpdate";
import { monthlyStockScoring } from "../../../server/jobs/monthlyStockScoring";
import { weeklyStockScoring } from "../../../server/jobs/weeklyStockScoring";

/**
 * Inngest API endpoint for handling scheduled jobs
 * This endpoint is called by Inngest to execute scheduled functions
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    weeklyStockScoring, // Every Saturday 0:00 JST
    monthlyStockScoring, // Every 1st 0:00 JST
    monthlySectorAveragesUpdate, // Every 1st 14:00 JST
  ],
});
