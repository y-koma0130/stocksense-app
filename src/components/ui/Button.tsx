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
    outlineColor: "#E9F355",
    outlineOffset: "2px",
  },
});

const variantStyles = {
  primary: css({
    backgroundColor: "#E9F355",
    color: "#2E2E2E",
    _hover: {
      backgroundColor: "#F5FF7A",
      transform: "translateY(-1px)",
    },
    _active: {
      transform: "translateY(0)",
    },
  }),
  secondary: css({
    backgroundColor: "#2E2E2E",
    color: "#E5E5E5",
    border: "1px solid #555",
    _hover: {
      backgroundColor: "#3A3A3A",
      borderColor: "#666",
    },
  }),
  ghost: css({
    backgroundColor: "transparent",
    color: "#E5E5E5",
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
