import { ToggleButtonGroup } from "@/components/ui/ToggleButtonGroup";

type PeriodType = "mid_term" | "long_term";

type PeriodTypeToggleProps = Readonly<{
  periodType: PeriodType;
  onToggle: (periodType: PeriodType) => void;
}>;

const periodTypeOptions = [
  { value: "mid_term" as const, label: "中期" },
  { value: "long_term" as const, label: "長期" },
];

export const PeriodTypeToggle = ({ periodType, onToggle }: PeriodTypeToggleProps) => {
  return <ToggleButtonGroup options={periodTypeOptions} value={periodType} onChange={onToggle} />;
};
