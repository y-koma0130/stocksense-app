import { Button } from "@/components/ui/Button";
import { css } from "../../../../styled-system/css";

type ScoreTypeToggleProps = Readonly<{
  scoreType: "mid_term" | "long_term";
  onToggle: (scoreType: "mid_term" | "long_term") => void;
}>;

export const ScoreTypeToggle = ({ scoreType, onToggle }: ScoreTypeToggleProps) => {
  return (
    <div className={toggleContainerStyle}>
      <Button
        size="sm"
        variant={scoreType === "long_term" ? "primary" : "secondary"}
        onClick={() => onToggle("long_term")}
      >
        週次
      </Button>
      <Button
        size="sm"
        variant={scoreType === "mid_term" ? "primary" : "secondary"}
        onClick={() => onToggle("mid_term")}
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
