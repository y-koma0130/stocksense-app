import type { ComponentPropsWithoutRef } from "react";
import { css, cx } from "../../../styled-system/css";

interface MarketSummaryCardProps extends ComponentPropsWithoutRef<"div"> {
  id?: string;
  title: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
}

export function MarketSummaryCard({
  id,
  title,
  price,
  change,
  changePercent,
  currency = "¥",
  className,
  ...props
}: MarketSummaryCardProps) {
  const isPositive = change >= 0;

  // Use decimal places for forex only (USD/JPY or JPY/USD)
  const isUsdjpy = id === "usdjpy";
  const isJpyUsd = isUsdjpy && currency === "$";
  const priceDecimals = isUsdjpy ? (isJpyUsd ? 5 : 2) : 0;
  const changeDecimals = isUsdjpy ? (isJpyUsd ? 5 : 2) : 0;

  const formattedPrice = new Intl.NumberFormat("ja-JP", {
    minimumFractionDigits: priceDecimals,
    maximumFractionDigits: priceDecimals,
  }).format(price);

  const formattedChange = new Intl.NumberFormat("ja-JP", {
    minimumFractionDigits: changeDecimals,
    maximumFractionDigits: changeDecimals,
    signDisplay: "always",
  }).format(change);

  const formattedChangePercent = new Intl.NumberFormat("ja-JP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
  }).format(changePercent);

  return (
    <div className={cx(cardStyle, className)} {...props}>
      <h3 className={titleStyle}>{title}</h3>
      <p className={priceStyle}>
        {currency}
        {formattedPrice}
      </p>
      <div className={changeContainerStyle}>
        <span className={changeLabelStyle}>前日比</span>
        <span className={cx(changeStyle, isPositive ? positiveStyle : negativeStyle)}>
          {formattedChange}
        </span>
        <span className={cx(changePercentStyle, isPositive ? positiveStyle : negativeStyle)}>
          ({formattedChangePercent}%)
        </span>
      </div>
    </div>
  );
}

const cardStyle = css({
  backgroundColor: "cardBg",
  borderRadius: "8px",
  padding: "1.25rem",
  border: "1px solid {colors.border}",
  transition: "all 0.2s",
  _hover: {
    backgroundColor: "cardBgHover",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
});

const titleStyle = css({
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "textMuted",
  marginBottom: "0.5rem",
});

const priceStyle = css({
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "text",
  marginBottom: "0.5rem",
});

const changeContainerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: "600",
});

const changeStyle = css({
  fontWeight: "600",
});

const changePercentStyle = css({
  fontWeight: "500",
});

const positiveStyle = css({
  color: "success",
});

const negativeStyle = css({
  color: "error",
});

const changeLabelStyle = css({
  color: "textMuted",
  fontWeight: "400",
});
