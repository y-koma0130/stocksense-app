import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";

type AlertVariant = "success" | "error" | "info" | "warning";

interface AlertProps extends ComponentPropsWithoutRef<"div"> {
  variant?: AlertVariant;
  children: ReactNode;
}

export function Alert({ variant = "info", className, children, ...props }: AlertProps) {
  return (
    <div className={cx(baseStyle, variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}

const baseStyle = css({
  padding: "0.75rem 1rem",
  borderRadius: "6px",
  fontSize: "0.875rem",
  textAlign: "center",
  width: "100%",
});

const variantStyles = {
  success: css({
    backgroundColor: "successBg",
    color: "success",
  }),
  error: css({
    backgroundColor: "errorBg",
    color: "error",
  }),
  info: css({
    backgroundColor: "#2E3A5C",
    color: "#9AB0E6",
  }),
  warning: css({
    backgroundColor: "#5C4A2E",
    color: "#E6D59A",
  }),
};
