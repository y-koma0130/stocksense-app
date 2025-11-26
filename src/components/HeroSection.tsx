"use client";

import { useEffect } from "react";
import {
  loadHeroDismissedFromStorage,
  saveHeroDismissedToStorage,
  useHeroDismissed,
  useHeroInitialized,
  useSetHeroDismissed,
  useSetHeroInitialized,
} from "@/stores/heroSection";
import { css } from "../../styled-system/css";

export const HeroSection = () => {
  const isDismissed = useHeroDismissed();
  const isInitialized = useHeroInitialized();
  const setIsDismissed = useSetHeroDismissed();
  const setIsInitialized = useSetHeroInitialized();

  useEffect(() => {
    if (!isInitialized) {
      const dismissed = loadHeroDismissedFromStorage();
      setIsDismissed(dismissed);
      setIsInitialized(true);
    }
  }, [isInitialized, setIsDismissed, setIsInitialized]);

  const handleDismiss = () => {
    saveHeroDismissedToStorage(true);
    setIsDismissed(true);
  };

  // 初期化前または非表示の場合は何も表示しない
  if (!isInitialized || isDismissed) {
    return null;
  }

  return (
    <section className={heroStyle}>
      <button
        type="button"
        onClick={handleDismiss}
        className={closeButtonStyle}
        aria-label="閉じる"
      >
        ✕
      </button>
      <h1 className={titleStyle}>StockSense</h1>
      <p className={taglineStyle}>割安株を自動検出し、LINEでお届け</p>
      <p className={descriptionStyle}>
        PER・PBR・RSIなど複数指標から割安度をスコアリング。罠銘柄を除外し、本当に狙い目の銘柄を週次で通知します。
      </p>
    </section>
  );
};

const heroStyle = css({
  position: "relative",
  textAlign: "center",
  paddingTop: "0.5rem",
  paddingBottom: "1rem",
  paddingX: "2.5rem",
  marginBottom: "1.5rem",
  borderBottom: "1px solid",
  borderColor: "border",
});

const closeButtonStyle = css({
  position: "absolute",
  top: "0.5rem",
  right: "0.5rem",
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

const titleStyle = css({
  fontSize: "2rem",
  fontWeight: "700",
  color: "accent",
  marginBottom: "0.5rem",
  letterSpacing: "-0.02em",
});

const taglineStyle = css({
  fontSize: "1.125rem",
  fontWeight: "600",
  color: "text",
  marginBottom: "0.75rem",
});

const descriptionStyle = css({
  fontSize: "0.875rem",
  color: "textMuted",
  maxWidth: "600px",
  marginX: "auto",
  lineHeight: "1.6",
});
