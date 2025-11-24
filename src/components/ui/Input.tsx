import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { css, cx } from "../../../styled-system/css";

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={wrapperStyle}>
        {label && (
          <label htmlFor={inputId} className={labelStyle}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cx(inputStyle, error && errorInputStyle, className)}
          {...props}
        />
        {error && <span className={errorTextStyle}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";

const wrapperStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  width: "100%",
});

const labelStyle = css({
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "text",
});

const inputStyle = css({
  padding: "0.75rem 1rem",
  backgroundColor: "background",
  border: "1px solid {colors.border}",
  borderRadius: "6px",
  color: "text",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.2s",
  width: "100%",
  _placeholder: {
    color: "textMuted",
  },
  _focus: {
    borderColor: "accent",
  },
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

const errorInputStyle = css({
  borderColor: "error",
  _focus: {
    borderColor: "error",
  },
});

const errorTextStyle = css({
  fontSize: "0.75rem",
  color: "error",
});
