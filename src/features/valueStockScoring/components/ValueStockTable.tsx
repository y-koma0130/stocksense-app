import { Tooltip } from "@/components/ui/Tooltip";
import type { ValueStockDto } from "@/server/features/valueStockScoring/application/dto/valueStock.dto";
import { getYahooFinanceUrl } from "@/utils/yahooFinanceUrl";
import { getScoreColor, SUCCESS_COLOR } from "@/constants/colors";
import { css } from "../../../../styled-system/css";

type ValueStockTableProps = Readonly<{
  data: readonly ValueStockDto[];
  onRowClick: (stock: ValueStockDto) => void;
  analyzedStockIds?: Set<string>;
}>;

export const ValueStockTable = ({
  data,
  onRowClick,
  analyzedStockIds = new Set(),
}: ValueStockTableProps) => {
  return (
    <div className={tableContainerStyle}>
      <table className={tableStyle}>
        <thead>
          <tr>
            <th className={thRankStyle}>順位</th>
            <th className={thTickerStyle}>コード</th>
            <th className={thNameStyle}>銘柄名</th>
            <th className={thMarketStyle}>市場</th>
            <th className={thSectorStyle}>業種</th>
            <th className={thScoreStyle}>
              <Tooltip content="複数の指標から算出した割安度のスコアリングです。スコアが高いほど割安と判断されます。業績等を加味して将来性が薄いと判断される企業は除外されています。">
                割安スコア
              </Tooltip>
            </th>
            <th className={thPriceStyle}>現在価格</th>
            <th className={thAnalysisStyle}>AI解析</th>
          </tr>
        </thead>
        <tbody>
          {data.map((stock, index) => {
            const scorePercent = stock.valueScore.totalScore * 100;
            const isAnalyzed = analyzedStockIds.has(stock.stockId);

            return (
              <tr
                key={stock.stockId}
                className={trStyle}
                onClick={() => onRowClick(stock)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick(stock);
                  }
                }}
              >
                <td className={tdRankStyle}>{index + 1}</td>
                <td className={tdTickerStyle}>{stock.tickerCode}</td>
                <td className={tdNameStyle}>
                  <a
                    href={getYahooFinanceUrl(stock.tickerCode)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={stockLinkStyle}
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
                </td>
                <td className={tdMarketStyle}>
                  {stock.market ? <span className={marketBadgeStyle}>{stock.market}</span> : "-"}
                </td>
                <td className={tdSectorStyle}>{stock.sectorName ?? "-"}</td>
                <td className={tdScoreStyle}>
                  <div className={scoreContainerStyle}>
                    <div className={scoreBarBgStyle}>
                      <div
                        className={scoreBarStyle}
                        style={{
                          width: `${scorePercent}%`,
                          backgroundColor: getScoreColor(scorePercent),
                        }}
                      />
                    </div>
                    <span
                      className={scoreValueStyle}
                      style={{ color: getScoreColor(scorePercent) }}
                    >
                      {scorePercent.toFixed(0)}
                    </span>
                  </div>
                </td>
                <td className={tdPriceStyle}>
                  {stock.currentPrice !== null ? `¥${stock.currentPrice.toLocaleString()}` : "-"}
                </td>
                <td className={tdAnalysisStyle}>
                  {isAnalyzed ? (
                    <span className={analysisCompleteBadgeStyle}>✓</span>
                  ) : (
                    <span className={analysisIncompleteBadgeStyle}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const tableContainerStyle = css({
  overflowX: "auto",
  backgroundColor: "cardBg",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
});

const tableStyle = css({
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
});

const thBaseStyle = {
  padding: "1rem",
  fontWeight: "600",
  color: "accent",
  borderBottom: "2px solid",
  borderColor: "border",
  whiteSpace: "nowrap" as const,
  backgroundColor: "cardBg",
};

const thRankStyle = css({
  ...thBaseStyle,
  textAlign: "center",
  width: "60px",
});

const thTickerStyle = css({
  ...thBaseStyle,
  textAlign: "center",
  width: "80px",
});

const thNameStyle = css({
  ...thBaseStyle,
  textAlign: "left",
  width: "140px",
});

const thMarketStyle = css({
  ...thBaseStyle,
  textAlign: "center",
  width: "100px",
});

const thSectorStyle = css({
  ...thBaseStyle,
  textAlign: "left",
  width: "120px",
});

const thScoreStyle = css({
  ...thBaseStyle,
  textAlign: "center",
  width: "140px",
});

const thPriceStyle = css({
  ...thBaseStyle,
  textAlign: "right",
  width: "100px",
});

const thAnalysisStyle = css({
  ...thBaseStyle,
  textAlign: "center",
  width: "80px",
});

const trStyle = css({
  borderBottom: "1px solid",
  borderColor: "border",
  transition: "background-color 0.2s ease",
  cursor: "pointer",
  _hover: {
    backgroundColor: "cardBgHover",
  },
  _focus: {
    outline: "2px solid",
    outlineColor: "accent",
    outlineOffset: "-2px",
  },
});

const tdBaseStyle = {
  padding: "0.875rem 1rem",
  color: "text",
};

const tdRankStyle = css({
  ...tdBaseStyle,
  textAlign: "center",
  fontWeight: "600",
  color: "textMuted",
});

const tdTickerStyle = css({
  ...tdBaseStyle,
  textAlign: "center",
  fontSize: "0.8125rem",
  fontWeight: "600",
  color: "accent",
});

const tdNameStyle = css({
  ...tdBaseStyle,
  textAlign: "left",
  fontWeight: "500",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const tdMarketStyle = css({
  ...tdBaseStyle,
  textAlign: "center",
});

const marketBadgeStyle = css({
  fontSize: "0.75rem",
  color: "text",
  backgroundColor: "surfaceHover",
  padding: "0.25rem 0.5rem",
  borderRadius: "4px",
  fontWeight: "500",
});

const tdSectorStyle = css({
  ...tdBaseStyle,
  textAlign: "left",
  fontSize: "0.8125rem",
  color: "textMuted",
});

const tdScoreStyle = css({
  ...tdBaseStyle,
  textAlign: "center",
});

const scoreContainerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

const scoreBarBgStyle = css({
  flex: 1,
  height: "8px",
  backgroundColor: "surfaceHover",
  borderRadius: "4px",
  overflow: "hidden",
});

const scoreBarStyle = css({
  height: "100%",
  borderRadius: "4px",
  transition: "width 0.3s ease",
});

const scoreValueStyle = css({
  fontSize: "0.875rem",
  fontWeight: "700",
  minWidth: "28px",
  textAlign: "right",
});

const tdPriceStyle = css({
  ...tdBaseStyle,
  textAlign: "right",
  fontWeight: "500",
  fontFeatureSettings: '"tnum"',
});

const stockLinkStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  color: "text",
  textDecoration: "none",
  transition: "color 0.2s ease",
  _hover: {
    color: "accent",
    textDecoration: "underline",
  },
});

const externalLinkIconStyle = css({
  width: "0.875rem",
  height: "0.875rem",
  opacity: 0.6,
  transition: "opacity 0.2s ease",
  _groupHover: {
    opacity: 1,
  },
});

const tdAnalysisStyle = css({
  ...tdBaseStyle,
  textAlign: "center",
});

const analysisCompleteBadgeStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  backgroundColor: SUCCESS_COLOR,
  color: "white",
  borderRadius: "50%",
  fontSize: "0.875rem",
  fontWeight: "700",
});

const analysisIncompleteBadgeStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  backgroundColor: "surfaceHover",
  color: "textMuted",
  borderRadius: "50%",
  fontSize: "0.875rem",
});
