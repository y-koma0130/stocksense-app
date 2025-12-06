import { getScoreColor } from "@/constants/colors";
import { css } from "../../../../../styled-system/css";

type TotalScoreBarProps = Readonly<{
  score: number;
}>;

export const TotalScoreBar = ({ score }: TotalScoreBarProps) => {
  const scorePercent = Math.round(score * 100);
  const scoreColor = getScoreColor(scorePercent);

  return (
    <div className={sectionStyle}>
      <h4 className={sectionTitleStyle}>総合スコア</h4>
      <div className={containerStyle}>
        <div className={barBgStyle}>
          <div
            className={barStyle}
            style={{
              width: `${scorePercent}%`,
              backgroundColor: scoreColor,
            }}
          />
        </div>
        <span className={valueStyle} style={{ color: scoreColor }}>
          {scorePercent.toFixed(0)}点
        </span>
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

const containerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
});

const barBgStyle = css({
  flex: 1,
  height: "12px",
  backgroundColor: "surfaceHover",
  borderRadius: "6px",
  overflow: "hidden",
});

const barStyle = css({
  height: "100%",
  borderRadius: "6px",
  transition: "width 0.3s ease",
});

const valueStyle = css({
  fontSize: "1.25rem",
  fontWeight: "700",
  minWidth: "60px",
  textAlign: "right",
});
