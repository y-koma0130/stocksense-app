"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MarketSummaryCard } from "@/components/ui/MarketSummaryCard";
import { css } from "../../../../styled-system/css";
import { useMarketData } from "../hooks/useMarketData";

export function MarketSummary() {
  const { data, loading, error } = useMarketData();
  const [currency, setCurrency] = useState<"JPY" | "USD">("JPY");

  if (loading) {
    return (
      <section>
        <div className={headerStyle}>
          <h2 className={sectionTitleStyle}>マーケットサマリー</h2>
        </div>
        <p className={loadingStyle}>読み込み中...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className={headerStyle}>
          <h2 className={sectionTitleStyle}>マーケットサマリー</h2>
        </div>
        <p className={errorStyle}>データの取得に失敗しました: {error}</p>
      </section>
    );
  }

  // Find USD/JPY rate
  const usdJpyRate = data.find((m) => m.id === "usdjpy")?.price ?? 150;

  // Convert prices based on selected currency
  const displayData = data.map((market) => {
    // Handle USD/JPY conversion for forex
    if (market.id === "usdjpy") {
      if (currency === "USD") {
        // Show as JPY/USD (円ドル) when in USD mode
        return {
          ...market,
          title: "円ドル",
          price: 1 / usdJpyRate,
          change: 0,
          changePercent: 0,
          currency: "$",
        };
      }
      return market; // Keep as USD/JPY (ドル円) in JPY mode
    }

    if (currency === "USD" && market.currency === "$") {
      // Already in USD
      return market;
    }
    if (currency === "JPY" && market.currency === "$") {
      // Convert USD to JPY
      return {
        ...market,
        price: market.price * usdJpyRate,
        change: market.change * usdJpyRate,
        currency: "¥",
      };
    }
    if (currency === "USD" && market.currency === "¥") {
      // Convert JPY to USD
      return {
        ...market,
        price: market.price / usdJpyRate,
        change: market.change / usdJpyRate,
        currency: "$",
      };
    }
    return market;
  });

  return (
    <section>
      <div className={headerStyle}>
        <h2 className={sectionTitleStyle}>マーケットサマリー</h2>
        <div className={toggleContainerStyle}>
          <Button
            size="sm"
            variant={currency === "JPY" ? "primary" : "secondary"}
            onClick={() => setCurrency("JPY")}
          >
            円
          </Button>
          <Button
            size="sm"
            variant={currency === "USD" ? "primary" : "secondary"}
            onClick={() => setCurrency("USD")}
          >
            ドル
          </Button>
        </div>
      </div>
      <div className={gridStyle}>
        {displayData.map((market) => (
          <MarketSummaryCard
            key={market.id}
            id={market.id}
            title={market.title}
            price={market.price}
            change={market.change}
            changePercent={market.changePercent}
            currency={market.currency}
          />
        ))}
      </div>
    </section>
  );
}

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
});

const sectionTitleStyle = css({
  fontSize: "1.25rem",
  fontWeight: "600",
  color: "text",
});

const toggleContainerStyle = css({
  display: "flex",
  gap: "0.5rem",
});

const gridStyle = css({
  display: "grid",
  gridTemplateColumns: {
    base: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
  },
  gap: "1rem",
});

const loadingStyle = css({
  color: "textMuted",
  fontSize: "0.875rem",
});

const errorStyle = css({
  color: "error",
  fontSize: "0.875rem",
});
