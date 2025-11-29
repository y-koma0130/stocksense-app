import { Skeleton } from "@/components/ui/Skeleton";
import { css } from "../../../../styled-system/css";

/**
 * 通知設定ドロワーのスケルトン
 */
export const NotificationSettingsDrawerSkeleton = () => {
  return (
    <div className={containerStyle}>
      {/* 連携状態セクション */}
      <div className={sectionStyle}>
        <Skeleton width="80px" height="14px" borderRadius="4px" />
        <Skeleton width="100px" height="32px" borderRadius="6px" style={{ marginTop: "0.75rem" }} />
      </div>

      {/* 通知設定セクション */}
      <div className={sectionStyle}>
        <Skeleton width="80px" height="14px" borderRadius="4px" />
        <div className={toggleContainerSkeletonStyle}>
          <Skeleton width="160px" height="16px" borderRadius="4px" />
          <Skeleton width="48px" height="26px" borderRadius="13px" />
        </div>
        <Skeleton width="200px" height="12px" borderRadius="4px" style={{ marginTop: "0.5rem" }} />
      </div>

      {/* 通知対象セクション */}
      <div className={sectionStyle}>
        <Skeleton width="140px" height="14px" borderRadius="4px" />
        <Skeleton width="100%" height="48px" borderRadius="8px" style={{ marginTop: "0.75rem" }} />
      </div>
    </div>
  );
};

const containerStyle = css({
  padding: "0.5rem 0",
});

const sectionStyle = css({
  marginBottom: "1.5rem",
});

const toggleContainerSkeletonStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  backgroundColor: "surfaceHover",
  borderRadius: "8px",
  marginTop: "0.75rem",
});
