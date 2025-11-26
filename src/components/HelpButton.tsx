"use client";

import {
  saveHeroDismissedToStorage,
  useHeroDismissed,
  useSetHeroDismissed,
} from "@/stores/heroSection";
import { css } from "../../styled-system/css";

export const HelpButton = () => {
  const isDismissed = useHeroDismissed();
  const setIsDismissed = useSetHeroDismissed();

  const handleClick = () => {
    saveHeroDismissedToStorage(false);
    setIsDismissed(false);
  };

  // ヒーローセクションが表示中の場合はボタンを表示しない
  if (!isDismissed) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonStyle}
      aria-label="サービスについて"
      title="サービスについて"
    >
      ?
    </button>
  );
};

const buttonStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  background: "none",
  border: "1px solid",
  borderColor: "text",
  borderRadius: "50%",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "text",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    backgroundColor: "surfaceHover",
    color: "primary",
    borderColor: "primary",
  },
});
