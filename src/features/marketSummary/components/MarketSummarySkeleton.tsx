import { Skeleton } from "@/components/ui/Skeleton";
import { css } from "../../../../styled-system/css";

/**
 * マーケットサマリーカードのスケルトン（単体）
 */
const MarketSummaryCardSkeleton = () => {
  return (
    <div className={cardStyle}>
      <Skeleton width="60px" height="14px" borderRadius="4px" />
      <Skeleton width="120px" height="28px" borderRadius="4px" style={{ marginTop: "0.5rem" }} />
      <div className={changeContainerStyle}>
        <Skeleton width="80px" height="14px" borderRadius="4px" />
      </div>
    </div>
  );
};

/**
 * マーケットサマリーセクション全体のスケルトン
 */
export const MarketSummarySkeleton = () => {
  return (
    <div className={gridStyle}>
      {Array.from({ length: 6 }).map((_, index) => (
        <MarketSummaryCardSkeleton key={`market-skeleton-${index}`} />
      ))}
    </div>
  );
};

const gridStyle = css({
  display: "grid",
  gridTemplateColumns: {
    base: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
  },
  gap: "1rem",
});

const cardStyle = css({
  backgroundColor: "cardBg",
  borderRadius: "8px",
  padding: "1.25rem",
  border: "1px solid {colors.border}",
});

const changeContainerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "0.5rem",
});
