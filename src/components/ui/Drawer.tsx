"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { css, cx } from "../../../styled-system/css";

type DrawerProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  width?: string;
}>;

export const Drawer = ({ isOpen, onClose, children, title, width = "400px" }: DrawerProps) => {
  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (typeof document === "undefined" || !isOpen) {
    return null;
  }

  return createPortal(
    <>
      {/* オーバーレイ */}
      <div className={cx(overlayStyle, overlayOpenStyle)} onClick={onClose} aria-hidden="true" />
      {/* ドロワー本体 */}
      <div
        className={cx(drawerStyle, drawerOpenStyle)}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
      >
        <div className={headerStyle}>
          {title && (
            <h2 id="drawer-title" className={titleStyle}>
              {title}
            </h2>
          )}
          <button type="button" onClick={onClose} className={closeButtonStyle} aria-label="閉じる">
            ✕
          </button>
        </div>
        <div className={contentStyle}>{children}</div>
      </div>
    </>,
    document.body,
  );
};

const overlayStyle = css({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  opacity: 0,
  visibility: "hidden",
  transition: "opacity 0.3s ease, visibility 0.3s ease",
  zIndex: 1000,
});

const overlayOpenStyle = css({
  opacity: 1,
  visibility: "visible",
});

const drawerStyle = css({
  position: "fixed",
  top: 0,
  right: 0,
  height: "100%",
  backgroundColor: "cardBg",
  boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.3)",
  transform: "translateX(100%)",
  transition: "transform 0.3s ease",
  zIndex: 1001,
  display: "flex",
  flexDirection: "column",
  maxWidth: "100vw",
});

const drawerOpenStyle = css({
  transform: "translateX(0)",
});

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 1.5rem",
  borderBottom: "1px solid",
  borderColor: "border",
  flexShrink: 0,
});

const titleStyle = css({
  fontSize: "1.125rem",
  fontWeight: "600",
  color: "text",
  margin: 0,
});

const closeButtonStyle = css({
  background: "none",
  border: "none",
  fontSize: "1.25rem",
  color: "textMuted",
  cursor: "pointer",
  padding: "0.5rem",
  borderRadius: "4px",
  transition: "background-color 0.2s, color 0.2s",
  _hover: {
    backgroundColor: "surfaceHover",
    color: "text",
  },
});

const contentStyle = css({
  flex: 1,
  overflowY: "auto",
  padding: "1.5rem",
});
