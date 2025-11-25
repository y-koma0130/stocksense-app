"use client";

import { css } from "../../../../styled-system/css";
import { useSetNotificationDrawerOpen } from "../stores/notificationDrawer";

export const NotificationButton = () => {
  const setDrawerOpen = useSetNotificationDrawerOpen();

  const handleClick = () => {
    setDrawerOpen(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonStyle}
      aria-label="通知設定"
      title="通知設定"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      通知設定
    </button>
  );
};

const buttonStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  backgroundColor: "transparent",
  border: "1px solid",
  borderColor: "accent",
  borderRadius: "6px",
  color: "accent",
  fontSize: "0.875rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    backgroundColor: "rgba(255, 204, 0, 0.1)",
  },
});
