"use client";

import { useState } from "react";
import { css } from "../../../../styled-system/css";

export const ScoringInfoBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={containerStyle}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={headerButtonStyle}
      >
        <span className={headerTextStyle}>
          <span className={iconStyle}>?</span>
          スコアについて
        </span>
        <span className={chevronStyle} data-expanded={isExpanded}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className={contentStyle}>
          <div className={sectionStyle}>
            <h4 className={sectionTitleStyle}>スコアリングの仕組み</h4>
            <p className={textStyle}>
              PER・PBR・RSI・価格位置などの指標から総合スコアを算出しています。
              各指標を業種平均と比較し、割安度を0〜100点で評価します。
            </p>
          </div>

          <div className={sectionStyle}>
            <h4 className={sectionTitleStyle}>罠銘柄の除外</h4>
            <p className={textStyle}>
              単に割安なだけでなく、以下の銘柄は除外しています：
            </p>
            <ul className={listStyle}>
              <li>自己資本比率が低い銘柄（財務健全性リスク）</li>
              <li>営業利益が連続減少している銘柄</li>
              <li>営業キャッシュフローが連続でマイナスの銘柄</li>
            </ul>
          </div>

          <p className={noteStyle}>
            ※ スコアは投資判断の参考情報です。実際の投資は自己責任でお願いします。
          </p>
        </div>
      )}
    </div>
  );
};

const containerStyle = css({
  marginBottom: "1rem",
  backgroundColor: "surfaceHover",
  borderRadius: "8px",
  overflow: "hidden",
});

const headerButtonStyle = css({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "text",
  transition: "background-color 0.2s",
  _hover: {
    backgroundColor: "cardBgHover",
  },
});

const headerTextStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: "500",
});

const iconStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.25rem",
  height: "1.25rem",
  backgroundColor: "accent",
  color: "cardBg",
  borderRadius: "50%",
  fontSize: "0.75rem",
  fontWeight: "700",
});

const chevronStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
  transition: "transform 0.2s",
  '&[data-expanded="true"]': {
    transform: "rotate(180deg)",
  },
});

const contentStyle = css({
  padding: "0 1rem 1rem",
  borderTop: "1px solid",
  borderColor: "border",
});

const sectionStyle = css({
  marginTop: "1rem",
});

const sectionTitleStyle = css({
  fontSize: "0.8125rem",
  fontWeight: "600",
  color: "text",
  marginBottom: "0.5rem",
});

const textStyle = css({
  fontSize: "0.8125rem",
  color: "textMuted",
  lineHeight: "1.6",
});

const listStyle = css({
  marginTop: "0.5rem",
  marginLeft: "1.25rem",
  fontSize: "0.8125rem",
  color: "textMuted",
  lineHeight: "1.8",
  listStyleType: "disc",
});

const noteStyle = css({
  marginTop: "1rem",
  fontSize: "0.75rem",
  color: "textMuted",
  fontStyle: "italic",
});
