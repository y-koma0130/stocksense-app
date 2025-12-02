/**
 * モバイル用のバリュー株カードコンポーネント
 */

import { getScoreColor, SUCCESS_COLOR } from "@/constants/colors";
import type { ValueStockDto } from "@/server/features/valueStockScoring/application/dto/valueStock.dto";
import { getYahooFinanceUrl } from "@/utils/yahooFinanceUrl";
import { css } from "../../../../styled-system/css";

type ValueStockCardProps = Readonly<{
  stock: ValueStockDto;
  rank: number;
  onClick: () => void;
  isAnalyzed: boolean;
}>;

export const ValueStockCard = ({ stock, rank, onClick, isAnalyzed }: ValueStockCardProps) => {
  const scorePercent = stock.valueScore.totalScore * 100;

  return (
    <button
      type="button"
      className={cardStyle}
      onClick={onClick}
      aria-label={`${stock.name}の詳細を表示`}
    >
      {/* 上部: 順位・銘柄情報とスコア */}
      <div className={cardTopRowStyle}>
        {/* 左側: 順位と銘柄情報 */}
        <div className={stockInfoStyle}>
          <div className={rankAndTickerStyle}>
            <span className={rankBadgeStyle}>{rank}位</span>
            <span className={tickerStyle}>{stock.tickerCode}</span>
            {stock.market && <span className={marketBadgeStyle}>{stock.market}</span>}
          </div>
          <a
            href={getYahooFinanceUrl(stock.tickerCode)}
            target="_blank"
            rel="noopener noreferrer"
            className={stockNameLinkStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {stock.name}
            <svg
              className={externalLinkIconStyle}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="外部リンク"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <span className={sectorStyle}>{stock.sectorName ?? "-"}</span>
        </div>

        {/* 右側: スコア表示 */}
        <div className={scoreContainerStyle}>
          <span className={scoreLabelStyle}>スコア</span>
          <span className={scoreValueStyle} style={{ color: getScoreColor(scorePercent) }}>
            {scorePercent.toFixed(0)}
          </span>
          <div className={scoreBarBgStyle}>
            <div
              className={scoreBarStyle}
              style={{
                width: `${scorePercent}%`,
                backgroundColor: getScoreColor(scorePercent),
              }}
            />
          </div>
        </div>
      </div>

      {/* 下部: 価格とAI解析ステータス */}
      <div className={cardFooterStyle}>
        <span className={priceStyle}>
          {stock.currentPrice !== null ? `¥${stock.currentPrice.toLocaleString()}` : "-"}
        </span>
        {isAnalyzed ? (
          <span className={analysisCompleteBadgeStyle}>✓ AI解析済</span>
        ) : (
          <span className={analysisIncompleteBadgeStyle}>AI解析なし</span>
        )}
      </div>
    </button>
  );
};

const cardStyle = css({
  display: "block",
  width: "100%",
  textAlign: "left",
  backgroundColor: "cardBg",
  borderRadius: "8px",
  padding: "0.625rem",
  border: "1px solid {colors.border}",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    backgroundColor: "cardBgHover",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  _focus: {
    outline: "2px solid",
    outlineColor: "accent",
    outlineOffset: "2px",
  },
});

const cardTopRowStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "0.75rem",
  marginBottom: "0.75rem",
});

const stockInfoStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  flex: 1,
  minWidth: 0,
});

const rankAndTickerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  flexWrap: "wrap",
});

const rankBadgeStyle = css({
  backgroundColor: "accent",
  color: "background",
  fontSize: "0.6875rem",
  fontWeight: "700",
  padding: "0.125rem 0.375rem",
  borderRadius: "4px",
  flexShrink: 0,
});

const tickerStyle = css({
  fontSize: "0.8125rem",
  fontWeight: "600",
  color: "accent",
  flexShrink: 0,
});

const marketBadgeStyle = css({
  fontSize: "0.625rem",
  color: "textMuted",
  backgroundColor: "surfaceHover",
  padding: "0.0625rem 0.25rem",
  borderRadius: "3px",
  fontWeight: "500",
});

const stockNameLinkStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  color: "text",
  fontSize: "0.875rem",
  fontWeight: "500",
  textDecoration: "none",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  _hover: {
    color: "accent",
    textDecoration: "underline",
  },
});

const externalLinkIconStyle = css({
  width: "0.6875rem",
  height: "0.6875rem",
  opacity: 0.6,
  flexShrink: 0,
});

const sectorStyle = css({
  fontSize: "0.6875rem",
  color: "textMuted",
});

const scoreContainerStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.25rem",
  width: "80px",
  flexShrink: 0,
});

const scoreLabelStyle = css({
  fontSize: "0.625rem",
  color: "textMuted",
  fontWeight: "500",
});

const scoreValueStyle = css({
  fontSize: "1.25rem",
  fontWeight: "700",
  lineHeight: 1,
});

const scoreBarBgStyle = css({
  width: "100%",
  height: "6px",
  backgroundColor: "surfaceHover",
  borderRadius: "3px",
  overflow: "hidden",
});

const scoreBarStyle = css({
  height: "100%",
  borderRadius: "3px",
  transition: "width 0.3s ease",
});

const cardFooterStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "0.5rem",
  paddingTop: "0.5rem",
  borderTop: "1px solid",
  borderColor: "border",
});

const priceStyle = css({
  fontSize: "0.9375rem",
  fontWeight: "600",
  color: "text",
  fontFeatureSettings: '"tnum"',
});

const analysisCompleteBadgeStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  fontSize: "0.6875rem",
  fontWeight: "600",
  color: SUCCESS_COLOR,
});

const analysisIncompleteBadgeStyle = css({
  fontSize: "0.6875rem",
  color: "textMuted",
});
