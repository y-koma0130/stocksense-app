"use client";

import { useState } from "react";
import type { FeedbackType } from "@/server/features/feedback/domain/values/feedbackType";
import { trpc } from "../../../../trpc/client";
import { useFeedbackModalOpen, useSetFeedbackModalOpen } from "../stores/feedbackModal";
import { FeedbackModal } from "./FeedbackModal";

export const FeedbackModalContainer = () => {
  const isOpen = useFeedbackModalOpen();
  const setIsOpen = useSetFeedbackModalOpen();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitMutation = trpc.feedback.submitFeedback.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setErrorMessage(null);
      alert("フィードバックを送信しました。ありがとうございます!");
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (params: { title: string; body: string; feedbackType: FeedbackType }) => {
    setErrorMessage(null);
    submitMutation.mutate(params);
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrorMessage(null);
  };

  return (
    <FeedbackModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={submitMutation.isPending}
      errorMessage={errorMessage}
    />
  );
};
