import { UiKitColor } from "@/constants/colors";
import { FC } from "react";
import "./LegendPanel.css";

export const LegendPanel: FC<{
  items: Array<{ color: UiKitColor; label: string }>;
}> = ({ items }) => {
  return (
    <div className={"legend-panel"}>
      {items.map(({ color, label }, index) => (
        <div className={"legend-item"} key={index}>
          <div
            className={"legend-item-color"}
            style={{
              backgroundColor: `var(--${color}-400)`,
            }}
          />
          <span className={"legend-item-text text-body-2-compact-semi"}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};
