import { css } from "../../../../../styled-system/css";

type PriceInfoSectionProps = Readonly<{
  currentPrice: number | null;
  priceHigh: number | null;
  priceLow: number | null;
  periodLabel: string;
}>;

export const PriceInfoSection = ({
  currentPrice,
  priceHigh,
  priceLow,
  periodLabel,
}: PriceInfoSectionProps) => {
  return (
    <div className={sectionStyle}>
      <h4 className={sectionTitleStyle}>価格情報</h4>
      <div className={gridStyle}>
        <div className={itemStyle}>
          <span className={labelStyle}>現在値</span>
          <span className={valueStyle}>
            {currentPrice !== null ? `¥${currentPrice.toLocaleString()}` : "-"}
          </span>
        </div>
        <div className={itemStyle}>
          <span className={labelStyle}>{periodLabel}高値</span>
          <span className={valueStyle}>
            {priceHigh !== null ? `¥${priceHigh.toLocaleString()}` : "-"}
          </span>
        </div>
        <div className={itemStyle}>
          <span className={labelStyle}>{periodLabel}安値</span>
          <span className={valueStyle}>
            {priceLow !== null ? `¥${priceLow.toLocaleString()}` : "-"}
          </span>
        </div>
      </div>
    </div>
  );
};

const sectionStyle = css({
  marginBottom: "1rem",
});

const sectionTitleStyle = css({
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "textMuted",
  marginBottom: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const gridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "0.75rem",
});

const itemStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
});

const labelStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
});

const valueStyle = css({
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "text",
});
