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
}: ActionCardProps) => {
  const styles = variantStyles[variant];

  const handleClick = () => {
    if (fileInput) {
      document.getElementById(fileInput.id)?.click();
    }
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`h-full min-h-[220px] bg-slate-50 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all group text-center ${styles.border}`}
    >
      {fileInput && (
        <input
          id={fileInput.id}
          type="file"
          className="hidden"
          accept={fileInput.accept}
          onChange={fileInput.onChange}
        />
      )}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${styles.icon}`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-medium max-w-[200px]">{description}</p>
    </button>
  );
};
