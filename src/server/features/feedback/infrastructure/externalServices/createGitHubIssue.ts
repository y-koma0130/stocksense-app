import { z } from "zod";
import type { FeedbackType } from "../../domain/values/feedbackType";
import { feedbackTypeToGitHubLabel } from "../../domain/values/feedbackType";

const GitHubIssueResponseSchema = z.object({
  id: z.number(),
  number: z.number(),
  html_url: z.string().url(),
  title: z.string(),
});

type GitHubIssueResponse = z.infer<typeof GitHubIssueResponseSchema>;

type CreateGitHubIssueParams = Readonly<{
  title: string;
  body: string;
  feedbackType: FeedbackType;
  userId: string;
  email: string;
}>;

export type CreateGitHubIssue = (params: CreateGitHubIssueParams) => Promise<GitHubIssueResponse>;

export const createGitHubIssue: CreateGitHubIssue = async (params) => {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;

  if (!token || !owner || !repo) {
    throw new Error("GitHub API credentials are not configured");
  }

  const issueBody = `## フィードバック内容
${params.body}

## 送信者情報
- User ID: ${params.userId}
- Email: ${params.email}
- 送信日時: ${new Date().toISOString()}

## 種別
${params.feedbackType}`;

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      title: `[ユーザーフィードバック] ${params.title}`,
      body: issueBody,
      labels: ["user-feedback", feedbackTypeToGitHubLabel(params.feedbackType)],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[createGitHubIssue] Failed to create issue:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    throw new Error(`Failed to create GitHub issue: ${response.statusText}`);
  }

  const data = await response.json();
  return GitHubIssueResponseSchema.parse(data);
};
