import { Button } from "@/components/ui/Button";
import { css } from "../../../../styled-system/css";

type PeriodTypeToggleProps = Readonly<{
  periodType: "weekly" | "monthly";
  onToggle: (periodType: "weekly" | "monthly") => void;
}>;

export const PeriodTypeToggle = ({ periodType, onToggle }: PeriodTypeToggleProps) => {
  return (
    <div className={toggleContainerStyle}>
      <Button
        variant={periodType === "weekly" ? "primary" : "secondary"}
        onClick={() => onToggle("weekly")}
      >
        週次
      </Button>
      <Button
        variant={periodType === "monthly" ? "primary" : "secondary"}
        onClick={() => onToggle("monthly")}
      >
        月次
      </Button>
    </div>
  );
};

const toggleContainerStyle = css({
  display: "flex",
  gap: "0.5rem",
});
