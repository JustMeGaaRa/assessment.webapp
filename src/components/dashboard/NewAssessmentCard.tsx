import { Plus } from "lucide-react";

interface NewAssessmentCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export const NewAssessmentCard = ({
  title,
  description,
  onClick,
}: NewAssessmentCardProps) => {
  return (
    <button
      onClick={onClick}
      className="h-full min-h-[220px] bg-slate-50 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center p-6 transition-all group text-center"
    >
      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Plus size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-medium max-w-[200px]">
        {description}
      </p>
    </button>
  );
};
