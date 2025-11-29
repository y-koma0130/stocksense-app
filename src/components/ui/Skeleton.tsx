import type { ComponentPropsWithoutRef } from "react";
import { css, cx } from "../../../styled-system/css";

type SkeletonProps = ComponentPropsWithoutRef<"div"> & {
  width?: string;
  height?: string;
  borderRadius?: string;
  variant?: "text" | "rectangular" | "circular";
};

/**
 * スケルトンローディングコンポーネント
 * シマーエフェクトでコンテンツのプレースホルダーを表示
 */
export const Skeleton = ({
  width,
  height,
  borderRadius,
  variant = "rectangular",
  className,
  style,
  ...props
}: SkeletonProps) => {
  const variantStyles = {
    text: { borderRadius: "4px", height: height ?? "1em" },
    rectangular: { borderRadius: borderRadius ?? "8px" },
    circular: { borderRadius: "50%" },
  };

  return (
    <div
      className={cx(skeletonStyle, className)}
      style={{
        width,
        height,
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    />
  );
};

/**
 * テキスト行のスケルトン
 */
export const SkeletonText = ({ lines = 1, className }: { lines?: number; className?: string }) => {
  return (
    <div className={cx(skeletonTextContainerStyle, className)}>
      {Array.from({ length: lines }).map((_, index) => {
        const lineId = `skeleton-line-${lines}-${index}`;
        return (
          <Skeleton
            key={lineId}
            variant="text"
            width={index === lines - 1 && lines > 1 ? "70%" : "100%"}
            height="1em"
          />
        );
      })}
    </div>
  );
};

const skeletonStyle = css({
  backgroundColor: "surfaceHover",
  animation: "shimmer 1.5s infinite",
  backgroundImage:
    "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)",
  backgroundSize: "200% 100%",
});

const skeletonTextContainerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});
