import { FC, ReactNode } from "react";
import "./Button.css";

export const Button: FC<{
  title: string;
  variant?: "primary" | "secondary" | "accent";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}> = ({ title, variant, leftIcon, rightIcon, className }) => {
  return (
    <button
      className={`button ${variant ? `btn-${variant}` : ""} ${className}`}
    >
      {leftIcon && leftIcon}
      {title}
      {rightIcon && rightIcon}
    </button>
  );
};
