import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { css } from "../../../styled-system/css";

type ToggleOption<T extends string> = Readonly<{
  value: T;
  label: string;
  tooltip?: string;
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
      {options.map((option) => {
        const button = (
          <Button
            key={option.value}
            size="sm"
            variant={value === option.value ? "primary" : "secondary"}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );

        if (option.tooltip) {
          return (
            <Tooltip key={option.value} content={option.tooltip} showUnderline={false} noWrap>
              {button}
            </Tooltip>
          );
        }

        return button;
      })}
    </div>
  );
};

const containerStyle = css({
  display: "flex",
  gap: "0.5rem",
});
