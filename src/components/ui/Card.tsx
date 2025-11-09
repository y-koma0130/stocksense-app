import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cx(cardStyle, className)} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cx(headerStyle, className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends ComponentPropsWithoutRef<"h2"> {
  children: ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h2 className={cx(titleStyle, className)} {...props}>
      {children}
    </h2>
  );
}

interface CardContentProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cx(contentStyle, className)} {...props}>
      {children}
    </div>
  );
}

const cardStyle = css({
  backgroundColor: "cardBg",
  borderRadius: "12px",
  padding: "2.5rem",
  width: "100%",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
});

const headerStyle = css({
  marginBottom: "1.5rem",
});

const titleStyle = css({
  fontSize: "1.5rem",
  fontWeight: "600",
  color: "accent",
  marginBottom: "0.5rem",
});

const contentStyle = css({
  color: "text",
});
