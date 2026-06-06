import { Check } from "lucide-react";

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  count?: number;
  showCheck?: boolean;
}

export const FilterChip = ({
  label,
  isSelected,
  onClick,
  count,
  showCheck = false,
}: FilterChipProps) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${
        isSelected
          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-500"
          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
      }`}
    >
      {showCheck && isSelected && (
        <Check size={14} strokeWidth={3} className="text-white shrink-0" />
      )}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black transition-all ${
            isSelected
              ? "bg-indigo-700 text-indigo-100"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
