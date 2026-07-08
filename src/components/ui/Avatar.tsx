import { FC } from "react";
import { UiKitColor } from "@/constants/colors";
import "./Avatar.css";

export const Avatar: FC<{
  label: string;
  colorPalette: UiKitColor;
}> = ({ label, colorPalette }) => {
  return (
    <div
      className={"avatar"}
      style={{ backgroundColor: `var(--${colorPalette}-400)` }}
    >
      {label
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")}
    </div>
  );
};
