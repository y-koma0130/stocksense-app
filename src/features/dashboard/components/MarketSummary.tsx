"use client";

import { MarketSummaryCard } from "@/components/ui/MarketSummaryCard";
import { css } from "../../../../styled-system/css";
import { mockMarketData } from "../data/mockMarketData";

export function MarketSummary() {
  return (
    <section>
      <h2 className={sectionTitleStyle}>マーケットサマリー</h2>
      <div className={gridStyle}>
        {mockMarketData.map((market) => (
          <MarketSummaryCard
            key={market.id}
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

const sectionTitleStyle = css({
  fontSize: "1.25rem",
  fontWeight: "600",
  color: "text",
  marginBottom: "1rem",
});

const gridStyle = css({
  display: "grid",
  gridTemplateColumns: {
    base: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(5, 1fr)",
  },
  gap: "1rem",
});
