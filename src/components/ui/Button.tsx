import React from "react";
import "./Button.css";

type ButtonVariant = "accent" | "primary" | "secondary" | "green" | "dark";

interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  href?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

const variantMap: Partial<Record<ButtonVariant, string>> = {
  green: "accent",
  dark: "primary",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "accent",
  className = "",
  onClick,
  href,
  rightIcon,
  leftIcon,
  disabled = false,
  style,
  "aria-label": ariaLabel,
}) => {
  const resolvedVariant = variantMap[variant] ?? variant;
  const cls = `btn btn-${resolvedVariant}${className ? ` ${className}` : ""}`;

  const content = (
    <>
      {leftIcon && leftIcon}
      {children}
      {rightIcon && rightIcon}
    </>
  );

  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        className={cls}
        style={style}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={cls}
      onClick={onClick}
      style={style}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};
