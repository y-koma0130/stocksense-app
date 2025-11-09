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
  color: "#E5E5E5",
});

const inputStyle = css({
  padding: "0.75rem 1rem",
  backgroundColor: "#434343",
  border: "1px solid #555",
  borderRadius: "6px",
  color: "#E5E5E5",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.2s",
  width: "100%",
  _placeholder: {
    color: "#999",
  },
  _focus: {
    borderColor: "#E9F355",
  },
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

const errorInputStyle = css({
  borderColor: "#E69A9A",
  _focus: {
    borderColor: "#E69A9A",
  },
});

const errorTextStyle = css({
  fontSize: "0.75rem",
  color: "#E69A9A",
});
