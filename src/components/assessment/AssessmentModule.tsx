import { ChevronRight } from "lucide-react";
import type { Module } from "../../types";
import { AssessmentTopic } from "./AssessmentTopic";

export interface ModuleStats {
  id: string;
  score: number;
  max: number;
  average: number;
  weight: number;
  roleScore: number;
  completed: number;
  total: number;
  percentage?: number; // Optional now if we transition away, or we calculate it here.
}

interface AssessmentModuleProps {
  module: Module;
  isExpanded: boolean;
  stats: ModuleStats | undefined;
  onToggle: (id: string) => void;
  selectedStack: string;
  scores: Record<string, number>;
  notes: Record<string, string>;
  onScore: (id: string, score: number) => void;
  onNote: (id: string, note: string) => void;
  isReadOnly?: boolean;
}

export const AssessmentModule = ({
  module,
  isExpanded,
  stats,
  onToggle,
  selectedStack,
  scores,
  notes,
  onScore,
  onNote,
  isReadOnly,
}: AssessmentModuleProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200">
      {/* Module Header */}
      <div
        className={`p-5 flex items-center gap-4 cursor-pointer select-none hover:bg-slate-50 transition-colors ${
          isExpanded ? "bg-slate-50/50 border-b border-slate-100" : ""
        }`}
        onClick={() => onToggle(module.id)}
      >
        <div
          className={`transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          <ChevronRight className="text-slate-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-slate-800">{module.title}</h2>
            {stats && (
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">
                {stats.completed} / {stats.total}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 hidden md:block">
            {module.description}
          </p>
        </div>

        {stats && (
          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-sm font-bold ${
                (stats.percentage ?? 0) > 70
                  ? "text-emerald-600"
                  : (stats.percentage ?? 0) > 40
                    ? "text-amber-600"
                    : "text-slate-400"
              }`}
            >
              {stats.percentage ?? 0}%
            </span>
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  (stats.percentage ?? 0) > 70
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${stats.percentage ?? 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Module Topics (Expanded View) */}
      {isExpanded && (
        <div className="p-0 animate-in fade-in slide-in-from-top-2 duration-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-3 w-1/2">Topic & Discussion Points</th>
                <th className="px-6 py-3 text-right">Scoring (0-5)</th>
              </tr>
            </thead>
            <tbody>
              {module.topics.map((topic) => (
                <AssessmentTopic
                  key={topic.id}
                  topic={topic}
                  selectedStack={selectedStack}
                  score={scores[topic.id]}
                  note={notes[topic.id] || ""}
                  onScore={onScore}
                  onNote={onNote}
                  isReadOnly={isReadOnly}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
