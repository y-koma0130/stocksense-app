import { Tooltip } from "@/components/ui/Tooltip";
import type { ValueStockDto } from "@/server/features/valueStockScoring/application/dto/stockIndicator.dto";
import type { IndicatorScore } from "@/server/features/valueStockScoring/domain/services/calculateValueScore.service";
import { css } from "../../../../styled-system/css";

type ValueStockTableProps = Readonly<{
  data: readonly ValueStockDto[];
}>;

/**
 * スコアに応じた色を返す
 */
const getScoreColor = (score: IndicatorScore): string => {
  if (score === 100) return "#22c55e"; // 緑
  if (score === 75) return "#84cc16"; // 黄緑
  if (score === 50) return "#eab308"; // 黄
  if (score === 25) return "#f97316"; // オレンジ
  return "#ef4444"; // 赤
};

/**
 * 価格レンジ位置を計算（0〜100%）
 */
const calculatePriceRangePosition = (
  currentPrice: number | null,
  week52High: number | null,
  week52Low: number | null,
): number | null => {
  if (currentPrice === null || week52High === null || week52Low === null) {
    return null;
  }
  if (week52High === week52Low) return null;
  return ((currentPrice - week52Low) / (week52High - week52Low)) * 100;
};

/**
 * 業種比率を計算（業種平均に対する比率）
 */
const calculateSectorRatio = (value: number | null, sectorAvg: number | null): number | null => {
  if (value === null || sectorAvg === null || sectorAvg === 0) {
    return null;
  }
  return (value / sectorAvg) * 100;
};

export const ValueStockTable = ({ data }: ValueStockTableProps) => {
  return (
    <div className={tableContainerStyle}>
      <table className={tableStyle}>
        <thead>
          <tr>
            <th className={thLeftStyle}>順位</th>
            <th className={thLeftStyle}>銘柄コード</th>
            <th className={thLeftStyle}>銘柄名</th>
            <th className={thLeftStyle}>業種</th>
            <th className={thCenterStyle}>総合スコア</th>
            <th className={thCenterStyle}>現在値</th>
            <th className={thCenterStyle}>PER</th>
            <th className={thCenterStyle}>PBR</th>
            <th className={thCenterStyle}>RSI</th>
            <th className={thCenterStyle}>
              <Tooltip content="52週高値・安値の中で現在価格がどの位置にあるか（安値に近いほど割安）">
                価格位置
              </Tooltip>
            </th>
            <th className={thCenterStyle}>
              <Tooltip content="PER・PBRが業種平均と比べてどれだけ低いか（業種平均より低いほど割安）">
                業種相対
              </Tooltip>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((stock, index) => {
            const pricePosition = calculatePriceRangePosition(
              stock.currentPrice,
              stock.week52High,
              stock.week52Low,
            );
            const perRatio = calculateSectorRatio(stock.per, stock.sectorAvgPer);
            const pbrRatio = calculateSectorRatio(stock.pbr, stock.sectorAvgPbr);

            return (
              <tr key={stock.stockId} className={trStyle}>
                <td className={tdLeftStyle}>{index + 1}</td>
                <td className={tdLeftStyle}>{stock.tickerCode}</td>
                <td className={tdLeftStyle}>{stock.name}</td>
                <td className={tdLeftStyle}>{stock.sectorName ?? "-"}</td>
                <td className={tdScoreCenterStyle}>{stock.valueScore.totalScore.toFixed(4)}</td>
                <td className={tdCenterStyle}>
                  {stock.currentPrice !== null ? `¥${stock.currentPrice.toFixed(0)}` : "-"}
                </td>
                <td
                  className={tdCenterStyle}
                  style={{ color: getScoreColor(stock.valueScore.perScore) }}
                >
                  {stock.per !== null ? stock.per.toFixed(2) : "-"}
                  {perRatio !== null && (
                    <div className={subTextStyle}>({perRatio.toFixed(0)}%)</div>
                  )}
                </td>
                <td
                  className={tdCenterStyle}
                  style={{ color: getScoreColor(stock.valueScore.pbrScore) }}
                >
                  {stock.pbr !== null ? stock.pbr.toFixed(2) : "-"}
                  {pbrRatio !== null && (
                    <div className={subTextStyle}>({pbrRatio.toFixed(0)}%)</div>
                  )}
                </td>
                <td
                  className={tdCenterStyle}
                  style={{ color: getScoreColor(stock.valueScore.rsiScore) }}
                >
                  {stock.rsi !== null ? stock.rsi.toFixed(1) : "-"}
                </td>
                <td
                  className={tdCenterStyle}
                  style={{ color: getScoreColor(stock.valueScore.priceRangeScore) }}
                >
                  {pricePosition !== null ? `${pricePosition.toFixed(1)}%` : "-"}
                </td>
                <td className={tdCenterStyle}>
                  {stock.valueScore.sectorScore.toFixed(0)}
                  <div className={subTextStyle}>
                    (PER:{stock.valueScore.perScore}, PBR:{stock.valueScore.pbrScore})
                  </div>
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
  "&:nth-child(1)": { width: "4%" }, // 順位
  "&:nth-child(2)": { width: "7%" }, // 銘柄コード
  "&:nth-child(3)": { width: "12%" }, // 銘柄名
  "&:nth-child(4)": { width: "10%" }, // 業種
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
  width: "9%", // 各カラム
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
  fontWeight: "500",
});

const tdScoreCenterStyle = css({
  ...tdCenterBaseStyle,
  color: "accent",
  fontWeight: "600",
  fontSize: "1rem",
});

const subTextStyle = css({
  fontSize: "0.75rem",
  opacity: 0.7,
  marginTop: "0.25rem",
});
