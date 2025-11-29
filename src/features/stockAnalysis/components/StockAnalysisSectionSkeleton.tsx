import { Skeleton } from "@/components/ui/Skeleton";
import { css } from "../../../../styled-system/css";

/**
 * AI分析レポートセクションのスケルトン
 */
export const StockAnalysisSectionSkeleton = () => {
  return (
    <div className={containerStyle}>
      {/* バリュー株評価 */}
      <div className={ratingContainerStyle}>
        <div className={ratingHeaderStyle}>
          <Skeleton width="100px" height="14px" borderRadius="4px" />
          <Skeleton width="80px" height="28px" borderRadius="4px" />
        </div>
        <Skeleton width="100%" height="48px" borderRadius="4px" style={{ marginTop: "0.75rem" }} />
      </div>

      {/* 投資魅力とリスク */}
      <div className={twoColumnStyle}>
        <div className={columnStyle}>
          <Skeleton width="120px" height="14px" borderRadius="4px" />
          <div className={listSkeletonStyle}>
            <Skeleton width="100%" height="48px" borderRadius="6px" />
            <Skeleton width="100%" height="48px" borderRadius="6px" />
          </div>
        </div>
        <div className={columnStyle}>
          <Skeleton width="120px" height="14px" borderRadius="4px" />
          <div className={listSkeletonStyle}>
            <Skeleton width="100%" height="48px" borderRadius="6px" />
            <Skeleton width="100%" height="48px" borderRadius="6px" />
          </div>
        </div>
      </div>
    </div>
  );
};

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const ratingContainerStyle = css({
  backgroundColor: "surfaceHover",
  padding: "1rem",
  borderRadius: "8px",
});

const ratingHeaderStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const twoColumnStyle = css({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem",
});

const columnStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const listSkeletonStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  marginTop: "0.5rem",
});
