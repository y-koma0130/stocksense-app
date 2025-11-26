"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { MarketSummary } from "@/features/marketSummary/components/MarketSummary";
import { ValueStockRanking } from "@/features/valueStockScoring/components/ValueStockRanking";
import { css } from "../../../styled-system/css";

export const DashboardClient = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const currentScrollY = scrollRef.current.scrollTop;
      const isScrollingUp = currentScrollY < prevScrollY;

      // 上にスクロールまたは最上部付近の場合は表示
      setIsHeaderVisible(isScrollingUp || currentScrollY < 10);

      setPrevScrollY(currentScrollY);
    }
  }, [prevScrollY]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        scrollElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  return (
    <div className={pageWrapperStyle} ref={scrollRef}>
      <Header isVisible={isHeaderVisible} />
      <div className={containerStyle}>
        <HeroSection />
        <MarketSummary />
        <div className={spacerStyle} />
        <ValueStockRanking />
      </div>
      <Footer />
    </div>
  );
};

const pageWrapperStyle = css({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflowY: "auto",
});

const containerStyle = css({
  flex: 1,
  padding: "1rem",
  backgroundColor: "background",
});

const spacerStyle = css({
  height: "3rem",
});
