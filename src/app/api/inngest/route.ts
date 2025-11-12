import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client";
import { testFunction } from "../../../../inngest/functions";

/**
 * Inngest API endpoint for handling scheduled jobs
 * This endpoint is called by Inngest to execute scheduled functions
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    testFunction,
    // Additional functions will be added here as we implement them:
    // - Weekly scoring job (every Saturday 0:00)
    // - Monthly scoring job (every 1st 0:00)
    // - Monthly sector averages update (every 1st 14:00)
  ],
});
