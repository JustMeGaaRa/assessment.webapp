import type { ReactNode } from "react";
import { CheckCircle2, Clock, XCircle, Sparkles, User, ShieldCheck } from "lucide-react";

type BadgeStatus = "completed" | "ongoing" | "rejected";
type BadgeVariant = "expert" | "llm" | "self" | "default";

interface BadgeProps {
  status?: BadgeStatus;
  variant?: BadgeVariant;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  completed: "border-emerald-100 text-emerald-600 bg-emerald-50",
  ongoing: "border-amber-100 text-amber-600 bg-amber-50",
  rejected: "border-red-100 text-red-600 bg-red-50",
};

const statusIcons: Record<BadgeStatus, ReactNode> = {
  completed: <CheckCircle2 size={12} />,
  ongoing: <Clock size={12} />,
  rejected: <XCircle size={12} />,
};

const variantStyles: Record<BadgeVariant, string> = {
  expert: "border-blue-100 text-blue-600 bg-blue-50",
  llm: "border-purple-100 text-purple-600 bg-purple-50",
  self: "border-teal-100 text-teal-600 bg-teal-50",
  default: "bg-slate-50 border-slate-100 text-slate-500",
};

const variantIcons: Record<BadgeVariant, ReactNode> = {
  expert: <ShieldCheck size={12} />,
  llm: <Sparkles size={12} />,
  self: <User size={12} />,
  default: null,
};

const variantLabels: Record<BadgeVariant, string> = {
  expert: "Expert",
  llm: "AI / LLM",
  self: "Self Evaluation",
  default: "",
};

export const Badge = ({ status, variant, icon, children, className = "" }: BadgeProps) => {
  const isStatus = status !== undefined;
  const isVariant = variant !== undefined && variant in variantStyles;

  const colorClasses = isStatus
    ? statusStyles[status]
    : isVariant
    ? variantStyles[variant!]
    : "bg-slate-50 border-slate-100 text-slate-500";

  const resolvedIcon = isStatus
    ? statusIcons[status]
    : isVariant
    ? variantIcons[variant!]
    : icon;

  const label = isStatus
    ? status
    : children || (isVariant ? variantLabels[variant!] : "");

  return (
    <div
      className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${colorClasses} ${className}`}
    >
      {resolvedIcon}
      {label}
    </div>
  );
};
