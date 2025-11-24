import { ToggleButtonGroup } from "@/components/ui/ToggleButtonGroup";

type PeriodType = "weekly" | "monthly";

type PeriodTypeToggleProps = Readonly<{
  periodType: PeriodType;
  onToggle: (periodType: PeriodType) => void;
}>;

const periodTypeOptions = [
  { value: "weekly" as const, label: "週次" },
  { value: "monthly" as const, label: "月次" },
];

export const PeriodTypeToggle = ({ periodType, onToggle }: PeriodTypeToggleProps) => {
  return <ToggleButtonGroup options={periodTypeOptions} value={periodType} onChange={onToggle} />;
};
