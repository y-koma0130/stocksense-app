import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { css, cx } from "../../../styled-system/css";

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={wrapperStyle}>
        {label && (
          <label htmlFor={selectId} className={labelStyle}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cx(selectStyle, error && errorSelectStyle, className)}
          {...props}
        >
          {children}
        </select>
        {error && <span className={errorTextStyle}>{error}</span>}
      </div>
    );
  },
);

Select.displayName = "Select";

const wrapperStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const labelStyle = css({
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "text",
});

const selectStyle = css({
  appearance: "none",
  padding: "0.625rem 2.25rem 0.625rem 0.75rem",
  backgroundColor: "cardBgHover",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "6px",
  color: "text",
  fontSize: "0.8125rem",
  outline: "none",
  cursor: "pointer",
  transition: "border-color 0.2s",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  _focus: {
    borderColor: "accent",
  },
  "& option": {
    backgroundColor: "cardBg",
    color: "text",
  },
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

const errorSelectStyle = css({
  borderColor: "error",
  _focus: {
    borderColor: "error",
  },
});

const errorTextStyle = css({
  fontSize: "0.75rem",
  color: "error",
});
