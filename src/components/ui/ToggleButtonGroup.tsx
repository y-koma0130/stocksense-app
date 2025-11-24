import { Button } from "@/components/ui/Button";
import { css } from "../../../styled-system/css";

type ToggleOption<T extends string> = Readonly<{
  value: T;
  label: string;
}>;

type ToggleButtonGroupProps<T extends string> = Readonly<{
  options: readonly ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}>;

export const ToggleButtonGroup = <T extends string>({
  options,
  value,
  onChange,
}: ToggleButtonGroupProps<T>) => {
  return (
    <div className={containerStyle}>
      {options.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={value === option.value ? "primary" : "secondary"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

const containerStyle = css({
  display: "flex",
  gap: "0.5rem",
});
