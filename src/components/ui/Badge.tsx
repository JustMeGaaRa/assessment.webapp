import type { ReactNode } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type BadgeStatus = "completed" | "ongoing" | "rejected";

interface BadgeProps {
  status?: BadgeStatus;
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

export const Badge = ({ status, icon, children, className = "" }: BadgeProps) => {
  const isStatus = status !== undefined;
  const colorClasses = isStatus
    ? statusStyles[status]
    : "bg-slate-50 border-slate-100 text-slate-500";
  const resolvedIcon = isStatus ? statusIcons[status] : icon;
  const label = isStatus ? status : children;

  return (
    <div
      className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${colorClasses} ${className}`}
    >
      {resolvedIcon}
      {label}
    </div>
  );
};
