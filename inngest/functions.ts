import { inngest } from "./client";

/**
 * Test function to verify Inngest setup
 * This will be replaced with actual scoring functions later
 */
export const testFunction = inngest.createFunction(
  { id: "test-function", name: "Test Inngest Setup" },
  { event: "test/hello" },
  async ({ event, step }) => {
    await step.run("log-message", async () => {
      console.log("Inngest is working!", event.data);
      return { message: "Hello from Inngest!" };
    });
  },
);
