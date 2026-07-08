import { FC } from "react";
import "./Tag.css";

export const Tag: FC<{
  children: React.ReactNode;
  variant?: "selectable" | "read-only";
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
}> = ({
  children,
  variant = "selectable",
  selected,
  disabled,
  onClick,
  leadingIcon,
  trailingIcon,
  className = "",
}) => {
  const classes = [
    "tag",
    `tag--${variant}`,
    onClick && !disabled ? "tag--clickable" : "",
    selected ? "tag--selected" : "",
    disabled ? "tag--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} onClick={!disabled ? onClick : undefined}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </span>
  );
};
