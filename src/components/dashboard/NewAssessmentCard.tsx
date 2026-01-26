import { Plus } from "lucide-react";

interface NewAssessmentCardProps {
  onClick: () => void;
}

export const NewAssessmentCard = ({ onClick }: NewAssessmentCardProps) => {
  return (
    <button
      onClick={onClick}
      className="h-full min-h-[220px] bg-slate-50 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center p-6 transition-all group text-center"
    >
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
        <Plus size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">New Assessment</h3>
      <p className="text-sm text-slate-500 font-medium max-w-[200px]">
        Start a new evaluation session for a candidate
      </p>
    </button>
  );
};
