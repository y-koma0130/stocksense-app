"use client";

import { css } from "../../../../styled-system/css";
import { useSetFilterListDrawerOpen } from "../stores/filterListDrawer";

export const FilterListButton = () => {
  const setDrawerOpen = useSetFilterListDrawerOpen();

  const handleClick = () => {
    setDrawerOpen(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonStyle}
      aria-label="マイリスト"
      title="マイリスト"
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
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
      マイリスト
    </button>
  );
};

const buttonStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "32px",
  gap: { base: "0.25rem", md: "0.375rem" },
  padding: { base: "0 0.5rem", md: "0 0.625rem" },
  backgroundColor: "transparent",
  border: "none",
  borderRadius: "6px",
  color: "accent",
  fontSize: { base: "0.6875rem", md: "0.75rem" },
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    backgroundColor: "rgba(255, 204, 0, 0.1)",
  },
});
