import { Tooltip } from "@/components/ui/Tooltip";
import { css } from "../../../../../styled-system/css";

type IndicatorSectionProps = Readonly<{
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
  periodLabel: string;
}>;

/**
 * 業種比率を計算
 */
const calculateSectorRatio = (value: number | null, sectorAvg: number | null): number | null => {
  if (value === null || sectorAvg === null || sectorAvg === 0) {
    return null;
  }
  return (value / sectorAvg) * 100;
};

/**
 * RSIの状態ラベルを取得
 */
const getRsiStatusLabel = (rsi: number): string => {
  if (rsi <= 30) return "売られすぎ";
  if (rsi >= 70) return "買われすぎ";
  return "中立";
};

export const IndicatorSection = ({
  per,
  pbr,
  rsi,
  sectorAvgPer,
  sectorAvgPbr,
  periodLabel,
}: IndicatorSectionProps) => {
  const perRatio = calculateSectorRatio(per, sectorAvgPer);
  const pbrRatio = calculateSectorRatio(pbr, sectorAvgPbr);

  return (
    <div className={sectionStyle}>
      <h4 className={sectionTitleStyle}>指標詳細</h4>
      <div className={gridStyle}>
        {/* PER */}
        <div className={itemStyle}>
          <div className={headerStyle}>
            <span className={labelStyle}>
              <Tooltip content="株価収益率。株価が1株あたり利益の何倍かを示します。一般的に15倍が基準とされますが、業種によって水準が異なります。">
                PER
              </Tooltip>
            </span>
            <span className={mainValueStyle}>{per !== null ? `${per.toFixed(2)}倍` : "-"}</span>
          </div>
          {perRatio !== null && (
            <div className={subStyle}>業種平均の{perRatio.toFixed(0)}%</div>
          )}
        </div>

        {/* PBR */}
        <div className={itemStyle}>
          <div className={headerStyle}>
            <span className={labelStyle}>
              <Tooltip content="株価純資産倍率。株価が1株あたり純資産の何倍かを示します。1倍未満は解散価値を下回っており、割安とされることがあります。">
                PBR
              </Tooltip>
            </span>
            <span className={mainValueStyle}>{pbr !== null ? `${pbr.toFixed(2)}倍` : "-"}</span>
          </div>
          {pbrRatio !== null && (
            <div className={subStyle}>業種平均の{pbrRatio.toFixed(0)}%</div>
          )}
        </div>

        {/* RSI */}
        <div className={itemStyle}>
          <div className={headerStyle}>
            <span className={labelStyle}>
              <Tooltip content="相対力指数。株価の過熱感を0〜100で示します。30以下は売られすぎ、70以上は買われすぎとされます。">
                {periodLabel}RSI
              </Tooltip>
            </span>
            <span className={mainValueStyle}>{rsi !== null ? rsi.toFixed(1) : "-"}</span>
          </div>
          {rsi !== null && <div className={subStyle}>{getRsiStatusLabel(rsi)}</div>}
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
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const itemStyle = css({
  backgroundColor: "surfaceHover",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
});

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.25rem",
});

const labelStyle = css({
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "textMuted",
});

const mainValueStyle = css({
  fontSize: "1.125rem",
  fontWeight: "700",
  color: "text",
});

const subStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "0.25rem",
  fontSize: "0.75rem",
  color: "textMuted",
});
