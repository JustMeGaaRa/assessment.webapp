import { Upload } from "lucide-react";

interface ImportAssessmentCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  accept?: string;
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImportAssessmentCard = ({
  title,
  description,
  onClick,
  accept,
  onImport,
}: ImportAssessmentCardProps) => {
  const handleClick = () => {
    document.getElementById("import-eval-input")?.click();
    onClick?.();
  };
  return (
    <button
      onClick={handleClick}
      className="h-full min-h-[220px] bg-slate-50 border-2 border-dashed border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center p-6 transition-all group text-center"
    >
      <input
        id="import-eval-input"
        type="file"
        className="hidden"
        accept={accept ?? ".json"}
        onChange={onImport}
      />
      <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Upload size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-medium max-w-[200px]">
        {description}
      </p>
    </button>
  );
};
