import { Tooltip } from "@/components/ui/Tooltip";
import type { StockScoreDto } from "@/server/features/valueStockScoring/application/dto/stockScore.dto";
import { css } from "../../../../styled-system/css";

type StockScoresTableProps = Readonly<{
  data: readonly StockScoreDto[];
}>;

export const StockScoresTable = ({ data }: StockScoresTableProps) => {
  return (
    <div className={tableContainerStyle}>
      <table className={tableStyle}>
        <thead>
          <tr>
            <th className={thLeftStyle}>順位</th>
            <th className={thLeftStyle}>銘柄コード</th>
            <th className={thLeftStyle}>銘柄名</th>
            <th className={thLeftStyle}>業種</th>
            <th className={thCenterStyle}>総合</th>
            <th className={thCenterStyle}>PER</th>
            <th className={thCenterStyle}>PBR</th>
            <th className={thCenterStyle}>RSI</th>
            <th className={thCenterStyle}>
              <Tooltip content="52週高値・安値の中で現在価格がどの位置にあるか（安値に近いほど高得点）">
                価格位置
              </Tooltip>
            </th>
            <th className={thCenterStyle}>
              <Tooltip content="PER・PBRが業種平均と比べてどれだけ低いか（業種平均より低いほど高得点）">
                業種相対
              </Tooltip>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((stock, index) => (
            <tr key={stock.stockId} className={trStyle}>
              <td className={tdLeftStyle}>{index + 1}</td>
              <td className={tdLeftStyle}>{stock.tickerCode}</td>
              <td className={tdLeftStyle}>{stock.name}</td>
              <td className={tdLeftStyle}>{stock.sectorName ?? "-"}</td>
              <td className={tdScoreCenterStyle}>{stock.totalScore.toFixed(4)}</td>
              <td className={tdCenterStyle}>{stock.perScore}</td>
              <td className={tdCenterStyle}>{stock.pbrScore}</td>
              <td className={tdCenterStyle}>{stock.rsiScore}</td>
              <td className={tdCenterStyle}>{stock.priceRangeScore}</td>
              <td className={tdCenterStyle}>{stock.sectorScore.toFixed(2)}</td>
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
  tableLayout: "fixed",
});

const thLeftStyle = css({
  padding: "1rem",
  textAlign: "left",
  fontWeight: "600",
  color: "accent",
  borderBottom: "2px solid",
  borderColor: "border",
  whiteSpace: "nowrap",
  backgroundColor: "cardBg",
  "&:nth-child(1)": { width: "5%" }, // 順位
  "&:nth-child(2)": { width: "8%" }, // 銘柄コード
  "&:nth-child(3)": { width: "15%" }, // 銘柄名
  "&:nth-child(4)": { width: "12%" }, // 業種
});

const thCenterStyle = css({
  padding: "1rem",
  textAlign: "center",
  fontWeight: "600",
  color: "accent",
  borderBottom: "2px solid",
  borderColor: "border",
  whiteSpace: "nowrap",
  backgroundColor: "cardBg",
  width: "10%", // 各スコアカラム
});

const trStyle = css({
  borderBottom: "1px solid",
  borderColor: "border",
  transition: "background-color 0.2s ease",
  _hover: {
    backgroundColor: "cardBgHover",
  },
});

const tdLeftStyle = css({
  padding: "1rem",
  textAlign: "left",
  color: "text",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const tdCenterBaseStyle = {
  padding: "1rem",
  textAlign: "center" as const,
  whiteSpace: "nowrap" as const,
};

const tdCenterStyle = css({
  ...tdCenterBaseStyle,
  color: "text",
});

const tdScoreCenterStyle = css({
  ...tdCenterBaseStyle,
  color: "accent",
  fontWeight: "600",
});
