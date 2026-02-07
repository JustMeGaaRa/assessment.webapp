import type { LevelMapping } from "../../types";
import { TrendingUp, TrendingDown, Award } from "lucide-react";

interface LibraryLevelsProps {
  levelMappings: LevelMapping[];
}

export const LibraryLevels = ({ levelMappings }: LibraryLevelsProps) => {
  if (!levelMappings || levelMappings.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No Level Scores Defined</h3>
        <p className="text-slate-500">
          Import a "Level Scores" CSV to see the mapping of scores to proficiency levels.
        </p>
      </div>
    );
  }

  // Sort mappings by minScore to ensure logical order
  const sortedMappings = [...levelMappings].sort((a, b) => a.minScore - b.minScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedMappings.map((mapping, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl group-hover:bg-indigo-600 transition-colors" />
          
          <div className="flex justify-between items-start mb-4">
            <div>
               <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                {mapping.level}
              </h3>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Proficiency Level
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Award size={20} />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 bg-slate-50 rounded-xl p-4">
             <div className="flex-1">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <TrendingDown size={14} />
                    <span>Min Score</span>
                </div>
                <div className="text-2xl font-black text-slate-700">
                    {mapping.minScore}
                </div>
             </div>
             <div className="w-px h-10 bg-slate-200" />
             <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 text-slate-500 text-sm mb-1">
                    <span>Max Score</span>
                    <TrendingUp size={14} />
                </div>
                <div className="text-2xl font-black text-slate-700">
                    {mapping.maxScore}
                </div>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};
