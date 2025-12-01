/**
 * モバイル用のバリュー株カードリストスケルトン
 */

import { Skeleton } from "@/components/ui/Skeleton";
import { css } from "../../../../styled-system/css";

type ValueStockCardListSkeletonProps = Readonly<{
  cardCount?: number;
}>;

const SkeletonCard = () => (
  <div className={cardStyle}>
    {/* 上部: 銘柄情報とスコア */}
    <div className={cardTopRowStyle}>
      {/* 左側: 銘柄情報 */}
      <div className={stockInfoStyle}>
        <div className={rankAndTickerStyle}>
          <Skeleton width="28px" height="16px" borderRadius="4px" />
          <Skeleton width="40px" height="14px" borderRadius="4px" />
          <Skeleton width="32px" height="12px" borderRadius="3px" />
        </div>
        <Skeleton width="100px" height="16px" borderRadius="4px" />
        <Skeleton width="60px" height="12px" borderRadius="4px" />
      </div>

      {/* 右側: スコア */}
      <div className={scoreContainerStyle}>
        <Skeleton width="32px" height="10px" borderRadius="4px" />
        <Skeleton width="36px" height="24px" borderRadius="4px" />
        <Skeleton width="100%" height="6px" borderRadius="3px" />
      </div>
    </div>

    {/* フッター */}
    <div className={cardFooterStyle}>
      <Skeleton width="72px" height="18px" borderRadius="4px" />
      <Skeleton width="64px" height="14px" borderRadius="4px" />
    </div>
  </div>
);

export const ValueStockCardListSkeleton = ({ cardCount = 10 }: ValueStockCardListSkeletonProps) => {
  const skeletonIds = Array.from({ length: cardCount }, (_, i) => `skeleton-card-${i + 1}`);

  return (
    <div className={cardListStyle}>
      {skeletonIds.map((id) => (
        <SkeletonCard key={id} />
      ))}
    </div>
  );
};

const cardListStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

const cardStyle = css({
  backgroundColor: "cardBg",
  borderRadius: "8px",
  padding: "1rem",
  border: "1px solid {colors.border}",
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
});

const rankAndTickerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
});

const scoreContainerStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.25rem",
  width: "80px",
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
