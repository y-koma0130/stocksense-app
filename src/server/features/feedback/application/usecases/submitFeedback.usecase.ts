import type { FeedbackType } from "../../domain/values/feedbackType";
import type { CreateGitHubIssue } from "../../infrastructure/externalServices/createGitHubIssue";

type Dependencies = Readonly<{
  createGitHubIssue: CreateGitHubIssue;
}>;

type Params = Readonly<{
  userId: string;
  email: string;
  title: string;
  body: string;
  feedbackType: FeedbackType;
}>;

export type SubmitFeedbackUsecase = (
  dependencies: Dependencies,
  params: Params,
) => Promise<{ success: boolean; issueUrl: string }>;

export const submitFeedbackUsecase: SubmitFeedbackUsecase = async (dependencies, params) => {
  // バリデーション
  if (params.title.length < 1 || params.title.length > 100) {
    throw new Error("タイトルは1〜100文字で入力してください");
  }

  if (params.body.length < 1 || params.body.length > 2000) {
    throw new Error("本文は1〜2000文字で入力してください");
  }

  // GitHub Issueを作成
  const issue = await dependencies.createGitHubIssue({
    title: params.title,
    body: params.body,
    feedbackType: params.feedbackType,
    userId: params.userId,
    email: params.email,
  });

  return {
    success: true,
    issueUrl: issue.html_url,
  };
};
