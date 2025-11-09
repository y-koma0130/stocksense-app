import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { css, cx } from "../../../styled-system/css";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cx(baseStyle, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

const baseStyle = css({
  fontWeight: "600",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s",
  outline: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
  },
  _focus: {
    outline: "2px solid",
    outlineColor: "accent",
    outlineOffset: "2px",
  },
});

const variantStyles = {
  primary: css({
    backgroundColor: "accent",
    color: "cardBg",
    _hover: {
      backgroundColor: "accentHover",
      transform: "translateY(-1px)",
    },
    _active: {
      transform: "translateY(0)",
    },
  }),
  secondary: css({
    backgroundColor: "cardBg",
    color: "text",
    border: "1px solid {colors.border}",
    _hover: {
      backgroundColor: "cardBgHover",
      borderColor: "border",
    },
  }),
  ghost: css({
    backgroundColor: "transparent",
    color: "text",
    _hover: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  }),
};

const sizeStyles = {
  sm: css({
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
  }),
  md: css({
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
  }),
  lg: css({
    padding: "0.875rem 2rem",
    fontSize: "1.125rem",
  }),
};
