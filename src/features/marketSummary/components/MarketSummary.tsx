"use client";

import { useState } from "react";
import { MarketSummaryCard } from "@/components/ui/MarketSummaryCard";
import { ToggleButtonGroup } from "@/components/ui/ToggleButtonGroup";
import { css } from "../../../../styled-system/css";
import { useMarketData } from "../hooks/useMarketData";
import { MarketSummarySkeleton } from "./MarketSummarySkeleton";

const currencyOptions = [
  { value: "JPY" as const, label: "円" },
  { value: "USD" as const, label: "ドル" },
];

export function MarketSummary() {
  const { data, loading, error } = useMarketData();
  const [currency, setCurrency] = useState<"JPY" | "USD">("JPY");

  // Find USD/JPY rate
  const usdJpyRate = data.find((m) => m.id === "usdjpy")?.price ?? 150;

  // Convert prices based on selected currency
  const displayData = data.map((market) => {
    // Handle USD/JPY conversion for forex
    if (market.id === "usdjpy") {
      if (currency === "USD") {
        // Show as JPY/USD (円ドル) when in USD mode
        // 前日のレートを計算: 現在のレート - 変動幅
        const previousRate = market.price - market.change;
        const currentInverse = 1 / market.price;
        const previousInverse = previousRate > 0 ? 1 / previousRate : 0;
        const inverseChange = currentInverse - previousInverse;
        // 変動率は反転する（ドル円が上がると円ドルは下がる）
        const inverseChangePercent =
          previousInverse > 0 ? (inverseChange / previousInverse) * 100 : 0;
        return {
          ...market,
          title: "円ドル",
          price: currentInverse,
          change: inverseChange,
          changePercent: inverseChangePercent,
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
        <ToggleButtonGroup options={currencyOptions} value={currency} onChange={setCurrency} />
      </div>

      {loading ? (
        <MarketSummarySkeleton />
      ) : error ? (
        <div className={errorContainerStyle}>
          <p className={errorStyle}>データの取得に失敗しました: {error}</p>
        </div>
      ) : (
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
      )}
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

const gridStyle = css({
  display: "grid",
  gridTemplateColumns: {
    base: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
  },
  gap: "1rem",
});

const errorContainerStyle = css({
  backgroundColor: "cardBg",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
});

const errorStyle = css({
  color: "error",
  fontSize: "0.875rem",
  padding: "2rem",
  textAlign: "center",
});
