import { useNavigate } from "react-router-dom";
import { ArrowLeft, Box } from "lucide-react";

interface LibraryHeaderProps {
  stacks: Record<string, string>;
  activeStack: string;
  onStackChange: (stack: string) => void;
}

export const LibraryHeader = ({
  stacks,
  activeStack,
  onStackChange,
}: LibraryHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="mb-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-semibold"
      >
        <ArrowLeft size={18} />
        <span>Back to Assessment</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
            <Box className="text-indigo-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            Assessment Matrix Library
          </h1>
          <p className="text-slate-500 font-medium">
            Standardized library of technical competencies
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {Object.values(stacks).map((s) => (
            <button
              key={s}
              onClick={() => onStackChange(s)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeStack === s
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
