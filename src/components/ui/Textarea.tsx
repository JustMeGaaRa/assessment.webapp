"use client";

import "./Textarea.css";
import React, { useId, useState } from "react";

interface TextareaProps {
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  name?: string;
  id?: string;
  className?: string;
  rows?: number;
  children?: React.ReactNode;
}

const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  disabled = false,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  name,
  id,
  rows = 2,
  className = "",
  children,
}) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  const currentValue = value !== undefined ? value : internalValue;

  const wrapperClass = [
    "textarea-wrapper",
    focused && !disabled ? "textarea-wrapper-active" : "",
    disabled ? "textarea-wrapper-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={wrapperClass}>
      <textarea
        id={textareaId}
        name={name}
        value={currentValue}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        rows={rows}
        className="textarea-element"
      />
      {children && <div className="textarea-footer">{children}</div>}
    </div>
  );
};

export default Textarea;
