import { useNavigate } from "react-router-dom";
import { Plus, Library, FileText } from "lucide-react";

export const AssessmentHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="mb-10">
      <div className="flex gap-4">
        <button
          onClick={() => {
            if (
              window.confirm("Are you sure? Unsaved progress will be lost.")
            ) {
              navigate("/");
            }
          }}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors mb-6 font-bold"
        >
          <Plus size={18} />
          <span>Start New Session</span>
        </button>

        <button
          onClick={() => navigate("/library")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-semibold"
        >
          <Library size={18} />
          <span>View Matrix Library</span>
        </button>
      </div>

      <div>
        <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
          <FileText className="text-indigo-600 w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
          Assessment Session
        </h1>
        <p className="text-slate-500 font-medium">
          Evaluate candidate technical competencies
        </p>
      </div>
    </header>
  );
};
