import { UiKitColor } from "@/constants/colors";
import { FC } from "react";
import "./ProgressIndicator.css";

export const ProgressIndicator: FC<{
  value: number;
  max?: number;
  min?: number;
  fill?: UiKitColor;
}> = ({ value, min = 0, max = 100, fill = "blue" }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  return (
    <div className={"progress-indicator"}>
      <div
        className={"progress-fill"}
        style={{
          width: `${normalizedPercentage}%`,
          backgroundColor: `var(--${fill}-400)`,
        }}
      ></div>
    </div>
  );
};
