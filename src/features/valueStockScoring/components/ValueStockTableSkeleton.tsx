import { Skeleton } from "@/components/ui/Skeleton";
import { css } from "../../../../styled-system/css";

type ValueStockTableSkeletonProps = Readonly<{
  rowCount?: number;
}>;

/**
 * 割安株テーブルのスケルトン
 */
export const ValueStockTableSkeleton = ({ rowCount = 10 }: ValueStockTableSkeletonProps) => {
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
            <th className={thScoreStyle}>割安スコア</th>
            <th className={thPriceStyle}>現在価格</th>
            <th className={thAnalysisStyle}>AI解析</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <tr key={`skeleton-row-${index}`} className={trStyle}>
              <td className={tdCenterStyle}>
                <Skeleton width="24px" height="16px" borderRadius="4px" />
              </td>
              <td className={tdCenterStyle}>
                <Skeleton width="48px" height="16px" borderRadius="4px" />
              </td>
              <td className={tdLeftStyle}>
                <Skeleton width="100px" height="16px" borderRadius="4px" />
              </td>
              <td className={tdCenterStyle}>
                <Skeleton width="60px" height="24px" borderRadius="4px" />
              </td>
              <td className={tdLeftStyle}>
                <Skeleton width="80px" height="16px" borderRadius="4px" />
              </td>
              <td className={tdCenterStyle}>
                <div className={scoreContainerStyle}>
                  <Skeleton width="100%" height="8px" borderRadius="4px" />
                  <Skeleton width="28px" height="16px" borderRadius="4px" />
                </div>
              </td>
              <td className={tdRightStyle}>
                <Skeleton width="70px" height="16px" borderRadius="4px" style={{ marginLeft: "auto" }} />
              </td>
              <td className={tdCenterStyle}>
                <Skeleton width="24px" height="24px" variant="circular" />
              </td>
            </tr>
          ))}
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
});

const tdBaseStyle = {
  padding: "0.875rem 1rem",
};

const tdCenterStyle = css({
  ...tdBaseStyle,
  textAlign: "center",
  "& > *": {
    margin: "0 auto",
  },
});

const tdLeftStyle = css({
  ...tdBaseStyle,
  textAlign: "left",
});

const tdRightStyle = css({
  ...tdBaseStyle,
  textAlign: "right",
});

const scoreContainerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
});
