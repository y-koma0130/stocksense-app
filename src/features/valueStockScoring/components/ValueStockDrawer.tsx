import { Drawer } from "@/components/ui/Drawer";
import type { ValueStockDto } from "@/server/features/valueStockScoring/application/dto/valueStock.dto";
import { getYahooFinanceUrl } from "@/utils/yahooFinanceUrl";
import { css } from "../../../../styled-system/css";

type ValueStockDrawerProps = Readonly<{
  stock: ValueStockDto | null;
  isOpen: boolean;
  onClose: () => void;
}>;

/**
 * トータルスコアに応じた色を返す（0〜1のスケール）
 */
const getTotalScoreColor = (score: number): string => {
  if (score >= 0.8) return "#22c55e";
  if (score >= 0.6) return "#84cc16";
  if (score >= 0.4) return "#eab308";
  if (score >= 0.2) return "#f97316";
  return "#ef4444";
};

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

export const ValueStockDrawer = ({ stock, isOpen, onClose }: ValueStockDrawerProps) => {
  if (!stock) return null;

  const pricePosition = calculatePriceRangePosition(
    stock.currentPrice,
    stock.priceHigh,
    stock.priceLow,
  );
  const perRatio = calculateSectorRatio(stock.per, stock.sectorAvgPer);
  const pbrRatio = calculateSectorRatio(stock.pbr, stock.sectorAvgPbr);
  const totalScorePercent = stock.valueScore.totalScore * 100;

  const drawerTitle = (
    <span className={drawerTitleContainerStyle}>
      {stock.tickerCode}｜
      <a
        href={getYahooFinanceUrl(stock.tickerCode)}
        target="_blank"
        rel="noopener noreferrer"
        className={drawerStockLinkStyle}
      >
        {stock.name}
        <svg
          className={drawerExternalLinkIconStyle}
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
    </span>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="40%" title={drawerTitle}>
      {/* 市場・業種情報 */}
      <div className={metaGridStyle}>
        {stock.market && (
          <div className={metaItemStyle}>
            <span className={metaLabelStyle}>市場</span>
            <span className={metaValueStyle}>{stock.market}</span>
          </div>
        )}
        {stock.sectorName && (
          <div className={metaItemStyle}>
            <span className={metaLabelStyle}>業種</span>
            <span className={metaValueStyle}>{stock.sectorName}</span>
          </div>
        )}
      </div>

      {/* 総合スコア */}
      <div className={sectionStyle}>
        <h4 className={sectionTitleStyle}>総合スコア</h4>
        <div className={totalScoreContainerStyle}>
          <div className={totalScoreBarBgStyle}>
            <div
              className={totalScoreBarStyle}
              style={{
                width: `${totalScorePercent}%`,
                backgroundColor: getTotalScoreColor(stock.valueScore.totalScore),
              }}
            />
          </div>
          <span
            className={totalScoreValueStyle}
            style={{ color: getTotalScoreColor(stock.valueScore.totalScore) }}
          >
            {totalScorePercent.toFixed(0)}点
          </span>
        </div>
      </div>

      {/* 指標詳細 */}
      <div className={sectionStyle}>
        <h4 className={sectionTitleStyle}>指標詳細</h4>
        <div className={indicatorGridStyle}>
          {/* PER */}
          <div className={indicatorItemStyle}>
            <div className={indicatorHeaderStyle}>
              <span className={indicatorLabelStyle}>PER</span>
              <span className={indicatorMainValueStyle}>
                {stock.per !== null ? `${stock.per.toFixed(2)}倍` : "-"}
              </span>
            </div>
            {perRatio !== null && (
              <div className={indicatorSubStyle}>業種平均の{perRatio.toFixed(0)}%</div>
            )}
          </div>

          {/* PBR */}
          <div className={indicatorItemStyle}>
            <div className={indicatorHeaderStyle}>
              <span className={indicatorLabelStyle}>PBR</span>
              <span className={indicatorMainValueStyle}>
                {stock.pbr !== null ? `${stock.pbr.toFixed(2)}倍` : "-"}
              </span>
            </div>
            {pbrRatio !== null && (
              <div className={indicatorSubStyle}>業種平均の{pbrRatio.toFixed(0)}%</div>
            )}
          </div>

          {/* RSI */}
          <div className={indicatorItemStyle}>
            <div className={indicatorHeaderStyle}>
              <span className={indicatorLabelStyle}>RSI</span>
              <span className={indicatorMainValueStyle}>
                {stock.rsi !== null ? stock.rsi.toFixed(1) : "-"}
              </span>
            </div>
            {stock.rsi !== null && (
              <div className={indicatorSubStyle}>
                {stock.rsi <= 30 ? "売られすぎ" : stock.rsi >= 70 ? "買われすぎ" : "中立"}
              </div>
            )}
          </div>

          {/* 52週価格位置 */}
          <div className={indicatorItemStyle}>
            <div className={indicatorHeaderStyle}>
              <span className={indicatorLabelStyle}>52週価格位置</span>
              <span className={indicatorMainValueStyle}>
                {pricePosition !== null ? `${pricePosition.toFixed(1)}%` : "-"}
              </span>
            </div>
            {pricePosition !== null && (
              <div className={indicatorSubStyle}>
                {pricePosition <= 25 ? "安値圏" : pricePosition >= 75 ? "高値圏" : "中間"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 価格情報 */}
      <div className={sectionStyle}>
        <h4 className={sectionTitleStyle}>価格情報</h4>
        <div className={priceGridStyle}>
          <div className={priceItemStyle}>
            <span className={priceLabelStyle}>現在値</span>
            <span className={priceValueStyle}>
              {stock.currentPrice !== null ? `¥${stock.currentPrice.toLocaleString()}` : "-"}
            </span>
          </div>
          <div className={priceItemStyle}>
            <span className={priceLabelStyle}>期間高値</span>
            <span className={priceValueStyle}>
              {stock.priceHigh !== null ? `¥${stock.priceHigh.toLocaleString()}` : "-"}
            </span>
          </div>
          <div className={priceItemStyle}>
            <span className={priceLabelStyle}>期間安値</span>
            <span className={priceValueStyle}>
              {stock.priceLow !== null ? `¥${stock.priceLow.toLocaleString()}` : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 業種平均参考値 */}
      <div className={sectionStyle}>
        <h4 className={sectionTitleStyle}>業種平均（参考）</h4>
        <div className={priceGridStyle}>
          <div className={priceItemStyle}>
            <span className={priceLabelStyle}>PER平均</span>
            <span className={priceValueStyle}>
              {stock.sectorAvgPer !== null ? stock.sectorAvgPer.toFixed(2) : "-"}
            </span>
          </div>
          <div className={priceItemStyle}>
            <span className={priceLabelStyle}>PBR平均</span>
            <span className={priceValueStyle}>
              {stock.sectorAvgPbr !== null ? stock.sectorAvgPbr.toFixed(2) : "-"}
            </span>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

const metaGridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "0.75rem",
  marginBottom: "1.5rem",
});

const metaItemStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
});

const metaLabelStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
});

const metaValueStyle = css({
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "text",
});

const sectionStyle = css({
  marginBottom: "1.5rem",
});

const sectionTitleStyle = css({
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "textMuted",
  marginBottom: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const totalScoreContainerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
});

const totalScoreBarBgStyle = css({
  flex: 1,
  height: "12px",
  backgroundColor: "surfaceHover",
  borderRadius: "6px",
  overflow: "hidden",
});

const totalScoreBarStyle = css({
  height: "100%",
  borderRadius: "6px",
  transition: "width 0.3s ease",
});

const totalScoreValueStyle = css({
  fontSize: "1.25rem",
  fontWeight: "700",
  minWidth: "60px",
  textAlign: "right",
});

const indicatorGridStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const indicatorItemStyle = css({
  backgroundColor: "surfaceHover",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
});

const indicatorHeaderStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.25rem",
});

const indicatorLabelStyle = css({
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "textMuted",
});

const indicatorMainValueStyle = css({
  fontSize: "1.125rem",
  fontWeight: "700",
  color: "text",
});

const indicatorSubStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "0.25rem",
  fontSize: "0.75rem",
  color: "textMuted",
});

const priceGridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "0.75rem",
});

const priceItemStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
});

const priceLabelStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
});

const priceValueStyle = css({
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "text",
});

const drawerTitleContainerStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
});

const drawerStockLinkStyle = css({
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

const drawerExternalLinkIconStyle = css({
  width: "1rem",
  height: "1rem",
  opacity: 0.6,
  transition: "opacity 0.2s ease",
});
