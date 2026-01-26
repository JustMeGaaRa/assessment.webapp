import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
        {label}
      </p>
      <p className="font-bold text-slate-700 text-sm truncate">{value}</p>
    </div>
  </div>
);
