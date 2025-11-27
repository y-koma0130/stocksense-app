import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client";
import { monthlyFinancialHealthCollection } from "../../../server/jobs/monthlyFinancialHealthCollection";
import { monthlyIndicatorCollection } from "../../../server/jobs/monthlyIndicatorCollection";
import { monthlyLineNotification } from "../../../server/jobs/monthlyLineNotification";
import { monthlyMarketAnalysis } from "../../../server/jobs/monthlyMarketAnalysis";
import { monthlySectorAveragesUpdate } from "../../../server/jobs/monthlySectorAveragesUpdate";
import { weeklyIndicatorCollection } from "../../../server/jobs/weeklyIndicatorCollection";
import { weeklyLineNotification } from "../../../server/jobs/weeklyLineNotification";
import { weeklyMarketAnalysis } from "../../../server/jobs/weeklyMarketAnalysis";

/**
 * Inngest API endpoint for handling scheduled jobs
 * This endpoint is called by Inngest to execute scheduled functions
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    monthlySectorAveragesUpdate, // Every 1st 14:00 JST
    weeklyIndicatorCollection, // Every Saturday 0:00 JST
    monthlyIndicatorCollection, // Every 1st 0:00 JST
    monthlyFinancialHealthCollection, // Every 1st 6:00 JST
    weeklyMarketAnalysis, // Every Monday 7:00 JST (before scoring job)
    monthlyMarketAnalysis, // Every 1st Monday 7:00 JST (before scoring job)
    weeklyLineNotification, // Every Monday 8:00 JST
    monthlyLineNotification, // Every 1st-3rd 8:00 JST (first weekday only)
  ],
});
