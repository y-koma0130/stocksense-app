import { z } from "zod";
import { authenticatedProcedure, router } from "../../../../../trpc/init";
import { submitFeedbackUsecase } from "../application/usecases/submitFeedback.usecase";
import { FeedbackTypeSchema } from "../domain/values/feedbackType";
import { createGitHubIssue } from "../infrastructure/externalServices/createGitHubIssue";

export const feedbackRouter = router({
  /**
   * フィードバック送信
   * router -> ユースケース -> GitHub API連携
   */
  submitFeedback: authenticatedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        body: z.string().min(1).max(2000),
        feedbackType: FeedbackTypeSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return submitFeedbackUsecase(
        { createGitHubIssue },
        {
          userId: ctx.user.id,
          email: ctx.user.email ?? "unknown@example.com",
          title: input.title,
          body: input.body,
          feedbackType: input.feedbackType,
        },
      );
    }),
});
