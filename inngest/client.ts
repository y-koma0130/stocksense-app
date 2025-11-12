import { Inngest } from "inngest";

/**
 * Inngest client for StockSense
 * Used for scheduled scoring jobs and notifications
 */
export const inngest = new Inngest({
  id: "stocksense",
  name: "StockSense Stock Scoring",
});
