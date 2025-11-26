import { z } from "zod";

export const FeedbackTypeSchema = z.enum(["bug", "feature", "ui", "other"]);

export type FeedbackType = z.infer<typeof FeedbackTypeSchema>;

export const feedbackTypeLabels: Record<FeedbackType, string> = {
  bug: "バグ報告",
  feature: "機能リクエスト",
  ui: "UI改善",
  other: "その他",
};

export const feedbackTypeToGitHubLabel = (type: FeedbackType): string => {
  switch (type) {
    case "bug":
      return "bug";
    case "feature":
      return "enhancement";
    case "ui":
      return "ui/ux";
    case "other":
      return "question";
  }
};
