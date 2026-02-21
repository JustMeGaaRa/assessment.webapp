import {
  MessageSquareQuote,
  Calendar,
  Box,
  ShieldCheck,
} from "lucide-react";

import type { ModuleState, AssessmentStatistics, AssessmentScores } from "../../types";
import { Card } from "../ui/Card";

export interface Assessor {
  id: string;
  name: string;
  color: string;
  text: string;
  light: string;
}

// --- File-local sub-components ---

const AssessorBadge = ({ assessor }: { assessor: Assessor }) => (
  <div
    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${assessor.light} ${assessor.text} border border-transparent shadow-sm`}
  >
    <div className={`w-2 h-2 rounded-full ${assessor.color}`} />
    {assessor.name}
  </div>
);

const AssessorScoreBar = ({
  assessor,
  score,
}: {
  assessor: Assessor;
  score: number;
}) => {
  const percentage = (score / 5) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter w-24 truncate">
          {assessor.name}
        </span>
        <span className={`text-[11px] font-black ${assessor.text}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${assessor.color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ModuleScoreCard = ({
  module,
  statistics,
  assessors,
}: {
  module: ModuleState;
  statistics: AssessmentStatistics;
  assessors: Assessor[];
}) => {
  const moduleStats = statistics.moduleStatistics[module.id];
  const averagePoints = moduleStats.averageScore.toFixed(1);
  const weight = moduleStats.weight;
  const weightedPoints = moduleStats.weightedScore.toFixed(2);

  const notes = Object.entries(moduleStats.assessorEvaluationStatistics)
    .filter(([, score]) => score.notes.length > 0)
    .map(([assessorId, score]) => {
      const assessor = assessors.find((a) => a.id === assessorId);
      return `${assessor?.name}: ${score.notes.join(". ")}`;
    });

  return (
    <div className="relative group bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:bg-slate-50 hover:shadow-md transition-all duration-300">
      {/* Module Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-4">
          <h4 className="font-black text-slate-800 text-base tracking-tight mb-1.5">
            {module.title}
          </h4>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {module.description}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-black text-slate-800">{averagePoints}</span>
            <span className="text-xs text-slate-400 font-bold uppercase">/ 5</span>
          </div>
          <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full mt-1 inline-block">
            {weightedPoints} points (weight: {weight}%)
          </div>
        </div>
      </div>

      {/* Stacked Assessor Bars */}
      <div className="space-y-4 mb-4">
        {assessors.map((assessor) => {
          const score =
            moduleStats.assessorEvaluationStatistics[assessor.id]?.averageScore ?? 0;
          return <AssessorScoreBar key={assessor.id} assessor={assessor} score={score} />;
        })}
      </div>

      {/* Module Notes */}
      {notes.length > 0 && (
        <div className="mt-6 flex gap-3 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <MessageSquareQuote size={16} className="text-slate-300 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            {notes.map((note, idx) => (
              <p
                key={idx}
                className="text-[11px] text-slate-500 italic font-medium leading-relaxed"
              >
                "{note}"
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main exported component ---

export const AssessmentSummaryCard = ({
  assessors,
  matrix,
  assessment,
  statistics,
}: {
  assessors: Assessor[];
  matrix: ModuleState[];
  assessment: AssessmentScores;
  statistics: AssessmentStatistics;
}) => {
  return (
    <Card className="rounded-2xl md:rounded-3xl hover:shadow-xl transition-all duration-500 flex flex-col h-full">
      <Card.Body className="p-6 md:p-8 relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100%] -mr-10 -mt-10" />

        {/* Header: Candidate Name + Score */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-4">
              {assessment.candidate.name}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-lg">
                <ShieldCheck size={16} />
                {statistics.proficiencyLevel && (
                  <>
                    <span>{statistics.proficiencyLevel}</span>
                    <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  </>
                )}
                {assessment.profile.title}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Box size={14} />
                  {assessment.stack.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {assessment.date.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-indigo-600">
              {statistics.totalScore.toFixed(1)}
            </div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
              Summary Score
            </div>
          </div>
        </div>

        {/* Assessors Section */}
        <div className="mb-10">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Interview Panel
          </div>
          <div className="flex flex-wrap gap-2">
            {assessors.map((assessor) => (
              <AssessorBadge key={assessor.id} assessor={assessor} />
            ))}
          </div>
        </div>

        {/* Modules Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-start">
          {matrix.map((module) => (
            <ModuleScoreCard
              key={module.id}
              module={module}
              statistics={statistics}
              assessors={assessors}
            />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};
