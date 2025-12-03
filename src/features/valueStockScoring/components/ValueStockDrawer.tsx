import { Drawer } from "@/components/ui/Drawer";
import type { PeriodType } from "@/constants/periodTypes";
import type { ValueStockDto } from "@/server/features/valueStockScoring/application/dto/valueStock.dto";
import { getYahooFinanceUrl } from "@/utils/yahooFinanceUrl";
import { css } from "../../../../styled-system/css";
import { StockAnalysisSection } from "../../stockAnalysis/components/StockAnalysisSection";
import { useStockAnalysis } from "../../stockAnalysis/hooks/useStockAnalysis";
import { IndicatorSection } from "./drawer/IndicatorSection";
import { PriceInfoSection } from "./drawer/PriceInfoSection";
import { SectorAverageSection } from "./drawer/SectorAverageSection";
import { StockMetaInfo } from "./drawer/StockMetaInfo";
import { StockTagBadges } from "./drawer/StockTagBadges";
import { TotalScoreBar } from "./drawer/TotalScoreBar";

type ValueStockDrawerProps = Readonly<{
  stock: ValueStockDto | null;
  isOpen: boolean;
  onClose: () => void;
  periodType: PeriodType;
}>;

export const ValueStockDrawer = ({ stock, isOpen, onClose, periodType }: ValueStockDrawerProps) => {
  const { data: analysisData, loading: analysisLoading } = useStockAnalysis({
    stockId: stock?.stockId ?? "",
    periodType,
  });

  if (!stock) return null;

  const periodLabel = periodType === "mid_term" ? "26週" : "52週";

  const drawerTitle = (
    <span className={titleContainerStyle}>
      {stock.tickerCode}｜
      <a
        href={getYahooFinanceUrl(stock.tickerCode)}
        target="_blank"
        rel="noopener noreferrer"
        className={stockLinkStyle}
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
    </span>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="40%" title={drawerTitle}>
      <StockMetaInfo market={stock.market} sectorName={stock.sectorName} />

      <StockTagBadges macroTagIds={stock.macroTagIds} themeTagIds={stock.themeTagIds} />

      <TotalScoreBar score={stock.valueScore.totalScore} />

      <StockAnalysisSection
        analysis={analysisData}
        loading={analysisLoading}
        periodType={periodType}
      />

      <IndicatorSection
        per={stock.per}
        pbr={stock.pbr}
        rsi={stock.rsi}
        sectorAvgPer={stock.sectorAvgPer}
        sectorAvgPbr={stock.sectorAvgPbr}
        periodLabel={periodLabel}
      />

      <PriceInfoSection
        currentPrice={stock.currentPrice}
        priceHigh={stock.priceHigh}
        priceLow={stock.priceLow}
        periodLabel={periodLabel}
      />

      <SectorAverageSection sectorAvgPer={stock.sectorAvgPer} sectorAvgPbr={stock.sectorAvgPbr} />
    </Drawer>
  );
};

const titleContainerStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
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
  width: "1rem",
  height: "1rem",
  opacity: 0.6,
  transition: "opacity 0.2s ease",
});
