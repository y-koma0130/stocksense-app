import { Skeleton } from "@/components/ui/Skeleton";
import { css } from "../../../../styled-system/css";

/**
 * 銘柄詳細ドロワーのスケルトン
 */
export const ValueStockDrawerSkeleton = () => {
  return (
    <div className={containerStyle}>
      {/* 市場・業種情報 */}
      <div className={metaGridStyle}>
        <div className={metaItemStyle}>
          <Skeleton width="40px" height="12px" borderRadius="4px" />
          <Skeleton
            width="80px"
            height="16px"
            borderRadius="4px"
            style={{ marginTop: "0.25rem" }}
          />
        </div>
        <div className={metaItemStyle}>
          <Skeleton width="40px" height="12px" borderRadius="4px" />
          <Skeleton
            width="100px"
            height="16px"
            borderRadius="4px"
            style={{ marginTop: "0.25rem" }}
          />
        </div>
      </div>

      {/* 総合スコア */}
      <div className={sectionStyle}>
        <Skeleton width="80px" height="14px" borderRadius="4px" />
        <div className={totalScoreContainerStyle}>
          <Skeleton width="100%" height="12px" borderRadius="6px" />
          <Skeleton width="50px" height="24px" borderRadius="4px" />
        </div>
      </div>

      {/* AI分析レポート */}
      <div className={sectionStyle}>
        <div className={sectionHeaderStyle}>
          <Skeleton width="120px" height="14px" borderRadius="4px" />
          <Skeleton width="80px" height="12px" borderRadius="4px" />
        </div>
        <Skeleton width="100%" height="24px" borderRadius="6px" style={{ marginTop: "0.5rem" }} />
        <Skeleton width="100%" height="80px" borderRadius="8px" style={{ marginTop: "0.75rem" }} />
        <div className={twoColumnStyle}>
          <Skeleton width="100%" height="100px" borderRadius="8px" />
          <Skeleton width="100%" height="100px" borderRadius="8px" />
        </div>
      </div>

      {/* 指標詳細 */}
      <div className={sectionStyle}>
        <Skeleton width="80px" height="14px" borderRadius="4px" />
        <div className={indicatorGridStyle}>
          {(["per", "pbr", "dividendYield", "roe"] as const).map((indicatorId) => (
            <div key={`indicator-skeleton-${indicatorId}`} className={indicatorItemStyle}>
              <div className={indicatorHeaderStyle}>
                <Skeleton width="60px" height="14px" borderRadius="4px" />
                <Skeleton width="50px" height="18px" borderRadius="4px" />
              </div>
              <Skeleton
                width="100px"
                height="12px"
                borderRadius="4px"
                style={{ marginTop: "0.25rem" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 価格情報 */}
      <div className={sectionStyle}>
        <Skeleton width="80px" height="14px" borderRadius="4px" />
        <div className={priceGridStyle}>
          {(["current", "high", "low"] as const).map((priceId) => (
            <div key={`price-skeleton-${priceId}`} className={priceItemStyle}>
              <Skeleton width="60px" height="12px" borderRadius="4px" />
              <Skeleton
                width="80px"
                height="16px"
                borderRadius="4px"
                style={{ marginTop: "0.25rem" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const metaGridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "0.75rem",
  marginBottom: "1rem",
});

const metaItemStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
});

const sectionStyle = css({
  marginBottom: "1rem",
});

const sectionHeaderStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const totalScoreContainerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginTop: "0.75rem",
});

const twoColumnStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "0.75rem",
  marginTop: "0.75rem",
});

const indicatorGridStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginTop: "0.75rem",
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
});

const priceGridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "0.75rem",
  marginTop: "0.75rem",
});

const priceItemStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
});
