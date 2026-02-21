import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  className?: string;
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps extends CardSectionProps {
  border?: boolean;
}

interface CardFooterProps extends CardSectionProps {
  border?: boolean;
}

const CardHeader = ({ children, border = false, className = "" }: CardHeaderProps) => (
  <div
    className={`px-6 pt-6 pb-4 ${border ? "border-b border-slate-100" : ""} ${className}`}
  >
    {children}
  </div>
);

const CardBody = ({ children, className = "" }: CardSectionProps) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardFooter = ({ children, border = true, className = "" }: CardFooterProps) => (
  <div
    className={`px-6 pb-6 pt-4 ${border ? "border-t border-slate-100" : ""} ${className}`}
  >
    {children}
  </div>
);

export const Card = ({
  children,
  onClick,
  hoverable = false,
  className = "",
  ...rest
}: CardProps) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${
      hoverable ? "hover:shadow-md cursor-pointer group transition-all" : ""
    } ${className}`}
    {...rest}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
