import { css } from "../../../../../styled-system/css";

type StockMetaInfoProps = Readonly<{
  market: string | null;
  sectorName: string | null;
}>;

export const StockMetaInfo = ({ market, sectorName }: StockMetaInfoProps) => {
  if (!market && !sectorName) {
    return null;
  }

  return (
    <div className={gridStyle}>
      {market && (
        <div className={itemStyle}>
          <span className={labelStyle}>市場</span>
          <span className={valueStyle}>{market}</span>
        </div>
      )}
      {sectorName && (
        <div className={itemStyle}>
          <span className={labelStyle}>業種</span>
          <span className={valueStyle}>{sectorName}</span>
        </div>
      )}
    </div>
  );
};

const gridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "0.75rem",
  marginBottom: "1rem",
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
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "text",
});
