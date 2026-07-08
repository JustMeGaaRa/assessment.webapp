import { UiKitColor } from "@/constants/colors";
import { FC } from "react";
import "./Badge.css";

export const Badge: FC<{
  label: string;
  colorPalette?: UiKitColor;
}> = ({ label, colorPalette = "gray" }) => {
  return (
    <div
      className={"badge text-label-semi"}
      style={{
        backgroundColor: `var(--${colorPalette}-200)`,
        color: `var(--${colorPalette}-500)`,
      }}
    >
      <span
        className={"badge-indicator"}
        style={{ backgroundColor: `var(--${colorPalette}-400)` }}
      />
      {label}
    </div>
  );
};
