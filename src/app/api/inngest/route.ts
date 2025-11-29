import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client";
import { monthlyFinancialHealthCollection } from "../../../server/jobs/monthlyFinancialHealthCollection";
import { monthlyIndicatorCollection } from "../../../server/jobs/monthlyIndicatorCollection";
import { monthlyLineNotification } from "../../../server/jobs/monthlyLineNotification";
import { monthlyMarketAnalysis } from "../../../server/jobs/monthlyMarketAnalysis";
import { monthlySectorAveragesUpdate } from "../../../server/jobs/monthlySectorAveragesUpdate";
import { monthlyStockAnalysis } from "../../../server/jobs/monthlyStockAnalysis";
import { weeklyIndicatorCollection } from "../../../server/jobs/weeklyIndicatorCollection";
import { weeklyLineNotification } from "../../../server/jobs/weeklyLineNotification";
import { weeklyMarketAnalysis } from "../../../server/jobs/weeklyMarketAnalysis";
import { weeklyStockAnalysis } from "../../../server/jobs/weeklyStockAnalysis";

/**
 * Inngest API endpoint for handling scheduled jobs
 * This endpoint is called by Inngest to execute scheduled functions
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // 週次ジョブ（土曜日深夜）
    weeklyIndicatorCollection, // Every Saturday 0:00 JST
    weeklyMarketAnalysis, // Every Saturday 2:00 JST (after indicator collection)
    weeklyStockAnalysis, // Every Saturday 4:00 JST (after market analysis)
    weeklyLineNotification, // Every Monday 7:00 JST (after stock analysis)
    // 月次ジョブ（毎月1日深夜）
    monthlyIndicatorCollection, // Every 1st 0:00 JST (with financial health)
    monthlyFinancialHealthCollection, // Every 1st 0:00 JST (with indicator)
    monthlyMarketAnalysis, // Every 1st 2:00 JST (after indicator collection)
    monthlyStockAnalysis, // Every 1st 4:00 JST (after market analysis)
    monthlyLineNotification, // Every 1st-3rd 7:00 JST (first weekday only)
    // 手動実行ジョブ
    monthlySectorAveragesUpdate, // Manual trigger: "sector-averages/update"
  ],
});
