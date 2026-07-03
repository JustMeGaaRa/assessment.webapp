import type { ReactNode, ChangeEventHandler } from "react";

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  variant?: "indigo" | "emerald";
  fileInput?: {
    id: string;
    accept: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
  };
  disabled?: boolean;
}

const variantStyles = {
  indigo: {
    border: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50",
    icon: "bg-indigo-50 text-indigo-500",
  },
  emerald: {
    border: "border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50/50",
    icon: "bg-emerald-100 text-emerald-500",
  },
};

export const ActionCard = ({
  icon,
  title,
  description,
  onClick,
  variant = "indigo",
  fileInput,
  disabled = false,
}: ActionCardProps) => {
  const styles = variantStyles[variant];

  const handleClick = () => {
    if (disabled) return;
    if (fileInput) {
      document.getElementById(fileInput.id)?.click();
    }
    onClick?.();
  };

  const borderClass = disabled
    ? "border-slate-200 bg-slate-50/50 cursor-not-allowed opacity-60"
    : styles.border;

  const iconClass = disabled
    ? "bg-slate-100 text-slate-400"
    : styles.icon;

  const scaleClass = disabled
    ? ""
    : "group-hover:scale-110";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`h-full min-h-[220px] bg-slate-50 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all group text-center ${borderClass}`}
    >
      {fileInput && (
        <input
          id={fileInput.id}
          type="file"
          className="hidden"
          accept={fileInput.accept}
          onChange={fileInput.onChange}
          disabled={disabled}
        />
      )}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform ${scaleClass} ${iconClass}`}
      >
        {icon}
      </div>
      <h3 className={`text-lg font-bold mb-2 ${disabled ? "text-slate-400" : "text-slate-800"}`}>{title}</h3>
      <p className={`text-sm font-medium max-w-[200px] ${disabled ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
    </button>
  );
};
