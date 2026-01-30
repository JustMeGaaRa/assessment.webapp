import { ChevronRight } from "lucide-react";
import type { ModuleState } from "../../types";
import { AssessmentTopic } from "./AssessmentTopic";

export interface AssessmentModuleStats {
  moduleId: string;
  completed: number;
  total: number;
}

interface AssessmentModuleProps {
  module: ModuleState;
  isExpanded: boolean;
  stats: AssessmentModuleStats;
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
  const percentage =
    stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200">
      {/* Module Header */}
      <div
        className={`p-4 md:p-5 flex items-start md:items-center gap-3 md:gap-4 cursor-pointer select-none hover:bg-slate-50 transition-colors ${
          isExpanded ? "bg-slate-50/50 border-b border-slate-100" : ""
        }`}
        onClick={() => onToggle(module.id)}
      >
        <div
          className={`mt-1 md:mt-0 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          <ChevronRight className="text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
            <h2 className="text-base md:text-lg font-bold text-slate-800 leading-tight">
              {module.title}
            </h2>
            {stats && (
              <span className="self-start md:self-auto text-[10px] md:text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium whitespace-nowrap">
                {stats.completed} / {stats.total}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 hidden md:block">
            {module.description}
          </p>
        </div>

        {stats && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span
              className={`text-sm font-bold ${
                (percentage ?? 0) === 0 ? "text-slate-400" : ""
              }`}
              style={
                (percentage ?? 0) > 0
                  ? {
                      color: `hsl(${Math.round(
                        ((percentage ?? 0) * 120) / 100,
                      )}, 70%, 45%)`,
                    }
                  : undefined
              }
            >
              {percentage ?? 0}%
            </span>
            <div className="w-16 md:w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${percentage ?? 0}%`,
                  backgroundColor: `hsl(${Math.round(
                    ((percentage ?? 0) * 120) / 100,
                  )}, 70%, 50%)`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Module Topics (Expanded View) */}
      {isExpanded && (
        <div className="p-0 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="hidden md:flex bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold px-6 py-3 border-b border-slate-100">
            <div className="w-1/2">Topic & Discussion Points</div>
            <div className="w-1/2 text-right">Scoring (0-5)</div>
          </div>
          <div>
            {module.topics.map((topic) => (
              <AssessmentTopic
                key={topic.id}
                topic={topic}
                selectedStack={selectedStack}
                score={scores[topic.id]}
                note={notes[topic.id]}
                onScore={onScore}
                onNote={onNote}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
