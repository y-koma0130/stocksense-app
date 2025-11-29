"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "../../../styled-system/css";

type TooltipProps = Readonly<{
  children: ReactNode;
  content: string;
}>;

const VIEWPORT_MARGIN = 10;
const TOOLTIP_OFFSET = 8;

const calculateTooltipPosition = (
  triggerRect: DOMRect,
  tooltipWidth: number,
  viewportWidth: number,
): { top: number; left: number } => {
  const centerPosition = triggerRect.left + triggerRect.width / 2;
  const halfTooltipWidth = tooltipWidth / 2;

  const wouldOverflowLeft = centerPosition - halfTooltipWidth < VIEWPORT_MARGIN;
  const wouldOverflowRight = centerPosition + halfTooltipWidth > viewportWidth - VIEWPORT_MARGIN;

  let adjustedLeft = centerPosition;

  if (wouldOverflowLeft) {
    adjustedLeft = halfTooltipWidth + VIEWPORT_MARGIN;
  } else if (wouldOverflowRight) {
    adjustedLeft = viewportWidth - halfTooltipWidth - VIEWPORT_MARGIN;
  }

  return {
    top: triggerRect.top - TOOLTIP_OFFSET,
    left: adjustedLeft,
  };
};

export const Tooltip = ({ children, content }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const newPosition = calculateTooltipPosition(
        triggerRect,
        tooltipRect.width,
        window.innerWidth,
      );

      setPosition(newPosition);
    }
  }, [isVisible]);

  const tooltipElement = isVisible ? (
    <span
      ref={tooltipRef}
      className={contentStyle}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {content}
    </span>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={containerStyle}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </button>
      {isMounted && tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};

const containerStyle = css({
  display: "inline-flex",
  alignItems: "center",
  cursor: "help",
  borderBottom: "1px dotted",
  borderColor: "accent",
  background: "transparent",
  border: "none",
  padding: 0,
  fontSize: "inherit",
  fontWeight: "inherit",
  color: "inherit",
});

const contentStyle = css({
  position: "fixed",
  transform: "translate(-50%, -100%)",
  backgroundColor: "cardBg",
  color: "text",
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
  fontSize: "0.75rem",
  maxWidth: "280px",
  whiteSpace: "normal",
  lineHeight: "1.5",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
  border: "1px solid",
  borderColor: "border",
  pointerEvents: "none",
  zIndex: 9999,
});
