import type { ProficiencyLevel } from "../../types";
import { TrendingUp, TrendingDown, Award } from "lucide-react";
import { Card } from "../ui/Card";
import { scoreStyles } from "./skillScoresData";

interface LibraryLevelsProps {
  levelMappings: ProficiencyLevel[];
}

export const LibraryLevels = ({ levelMappings }: LibraryLevelsProps) => {
  if (!levelMappings || levelMappings.length === 0) {
    return (
      <Card className="text-center py-20">
        <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-700">
          No Level Scores Defined
        </h3>
        <p className="text-slate-500">
          Import a "Level Scores" CSV to see the mapping of scores to
          proficiency levels.
        </p>
      </Card>
    );
  }

  // Sort mappings by minScore to ensure logical order
  const sortedMappings = [...levelMappings].sort(
    (a, b) => a.minScore - b.minScore,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedMappings.map((mapping, index) => {
        // Map index to a score style (1 to 5) for consistent colors
        const styleIndex = (index % 5) + 1;
        const style = scoreStyles[styleIndex] || scoreStyles[1];

        return (
          <Card
            key={index}
            hoverable
            className={`relative flex flex-col h-full border transition-all duration-300 group ${style.border} ${style.shadow}`}
          >
            {/* Top Accent Gradient Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.gradient}`}
            />

            <Card.Body className="flex flex-col flex-1">
              {/* Header Section */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${style.badge}`}
                    >
                      Tier {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors truncate">
                    {mapping.level}
                  </h3>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-sm transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                >
                  <Award size={20} />
                </div>
              </div>

              {/* Description Placeholder / Label */}
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Candidate score profile required to reach {mapping.level} level.
              </p>

              {/* Divider */}
              <div className="border-t border-slate-100 my-4" />

              {/* Scores Range Panel */}
              <div className="flex items-center gap-4 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <TrendingDown size={12} className={style.text} />
                    <span>Min Score</span>
                  </div>
                  <div className="text-2xl font-black text-slate-700">
                    {mapping.minScore}
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <span>Max Score</span>
                    <TrendingUp size={12} className={style.text} />
                  </div>
                  <div className="text-2xl font-black text-slate-700">
                    {mapping.maxScore}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};
