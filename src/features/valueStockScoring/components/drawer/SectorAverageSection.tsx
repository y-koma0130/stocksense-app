import { css } from "../../../../../styled-system/css";

type SectorAverageSectionProps = Readonly<{
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
}>;

export const SectorAverageSection = ({
  sectorAvgPer,
  sectorAvgPbr,
}: SectorAverageSectionProps) => {
  return (
    <div className={sectionStyle}>
      <h4 className={sectionTitleStyle}>業種平均（参考）</h4>
      <div className={gridStyle}>
        <div className={itemStyle}>
          <span className={labelStyle}>PER平均</span>
          <span className={valueStyle}>
            {sectorAvgPer !== null ? sectorAvgPer.toFixed(2) : "-"}
          </span>
        </div>
        <div className={itemStyle}>
          <span className={labelStyle}>PBR平均</span>
          <span className={valueStyle}>
            {sectorAvgPbr !== null ? sectorAvgPbr.toFixed(2) : "-"}
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
