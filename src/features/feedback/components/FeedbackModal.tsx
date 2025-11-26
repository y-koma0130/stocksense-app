"use client";

import { useState } from "react";
import type { FeedbackType } from "@/server/features/feedback/domain/values/feedbackType";
import { feedbackTypeLabels } from "@/server/features/feedback/domain/values/feedbackType";
import { css } from "../../../../styled-system/css";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Drawer } from "../../../components/ui/Drawer";

type FeedbackModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: { title: string; body: string; feedbackType: FeedbackType }) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}>;

export const FeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: FeedbackModalProps) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackType) return;
    onSubmit({ title, body, feedbackType });
  };

  const handleClose = () => {
    setTitle("");
    setBody("");
    setFeedbackType("");
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="フィードバック送信" width="500px">
      <form onSubmit={handleSubmit}>
        {errorMessage && (
          <div className={alertContainerStyle}>
            <Alert variant="error">{errorMessage}</Alert>
          </div>
        )}

        <div className={formGroupStyle}>
          <label htmlFor="feedbackType" className={labelStyle}>
            種別<span className={requiredStyle}>*</span>
          </label>
          <select
            id="feedbackType"
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
            className={selectStyle}
            disabled={isSubmitting}
            required
          >
            <option value="">選択してください</option>
            <option value="bug">{feedbackTypeLabels.bug}</option>
            <option value="feature">{feedbackTypeLabels.feature}</option>
            <option value="ui">{feedbackTypeLabels.ui}</option>
            <option value="other">{feedbackTypeLabels.other}</option>
          </select>
        </div>

        <div className={formGroupStyle}>
          <label htmlFor="title" className={labelStyle}>
            タイトル<span className={requiredStyle}>*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputStyle}
            placeholder="簡潔なタイトルを入力してください"
            maxLength={100}
            required
            disabled={isSubmitting}
          />
          <p className={helperTextStyle}>{title.length}/100文字</p>
        </div>

        <div className={formGroupStyle}>
          <label htmlFor="body" className={labelStyle}>
            詳細<span className={requiredStyle}>*</span>
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={textareaStyle}
            placeholder="詳しい内容を入力してください"
            maxLength={2000}
            rows={8}
            required
            disabled={isSubmitting}
          />
          <p className={helperTextStyle}>{body.length}/2000文字</p>
        </div>

        <div className={buttonGroupStyle}>
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
            disabled={isSubmitting}
            className={buttonStyle}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title || !body || !feedbackType}
            className={buttonStyle}
          >
            {isSubmitting ? "送信中..." : "送信"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

const alertContainerStyle = css({
  marginBottom: "1rem",
});

const formGroupStyle = css({
  marginBottom: "1.5rem",
});

const labelStyle = css({
  display: "block",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "text",
  marginBottom: "0.5rem",
});

const requiredStyle = css({
  color: "error",
  marginLeft: "0.25rem",
});

const inputStyle = css({
  width: "100%",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "4px",
  backgroundColor: "cardBg",
  color: "text",
  _focus: {
    outline: "none",
    borderColor: "primary",
  },
  _disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
});

const selectStyle = css({
  width: "100%",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "4px",
  backgroundColor: "cardBg",
  color: "text",
  cursor: "pointer",
  _focus: {
    outline: "none",
    borderColor: "primary",
  },
  _disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
});

const textareaStyle = css({
  width: "100%",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "4px",
  backgroundColor: "cardBg",
  color: "text",
  resize: "vertical",
  fontFamily: "inherit",
  _focus: {
    outline: "none",
    borderColor: "primary",
  },
  _disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
});

const helperTextStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
  marginTop: "0.25rem",
  textAlign: "right",
});

const buttonGroupStyle = css({
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
  marginTop: "1.5rem",
});

const buttonStyle = css({
  minWidth: "100px",
});
