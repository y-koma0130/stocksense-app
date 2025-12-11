import { Skeleton } from "@/components/ui/Skeleton";
import { css } from "../../../../styled-system/css";

/**
 * マイリストドロワーのスケルトン
 */
export const FilterListDrawerSkeleton = () => {
  return (
    <div className={containerStyle}>
      {/* デフォルトリストのスケルトン */}
      <div className={listItemSkeletonStyle}>
        <div className={listItemContentStyle}>
          <Skeleton width="120px" height="16px" borderRadius="4px" />
          <Skeleton width="80px" height="12px" borderRadius="4px" />
        </div>
        <Skeleton width="24px" height="24px" borderRadius="4px" />
      </div>

      {/* カスタムリストセクションのスケルトン */}
      <div className={sectionStyle}>
        <Skeleton width="100px" height="12px" borderRadius="4px" />
        <div className={listItemSkeletonStyle}>
          <div className={listItemContentStyle}>
            <Skeleton width="140px" height="16px" borderRadius="4px" />
            <Skeleton width="180px" height="12px" borderRadius="4px" />
          </div>
          <Skeleton width="24px" height="24px" borderRadius="4px" />
        </div>
      </div>

      {/* 新規作成ボタンのスケルトン */}
      <Skeleton width="100%" height="52px" borderRadius="8px" />
    </div>
  );
};

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

const sectionStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

const listItemSkeletonStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.875rem 1rem",
  backgroundColor: "surfaceHover",
  borderRadius: "8px",
});

const listItemContentStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});
