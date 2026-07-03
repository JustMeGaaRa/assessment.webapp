import { useState, useRef, useEffect } from "react";
import { MessageSquareQuote, Calendar, Box, ShieldCheck } from "lucide-react";
import {
  AssessmentSessionStatistics,
  AssessmentModuleStatistics,
  AssessmentSession,
  CompetenceMatrix,
  CompetenceMatrixModule,
  IndividualAssessmentScore,
} from "@lib/matrix/types";
import { Card } from "../ui/Card";

export interface Assessor {
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

const ModuleNote = ({ note }: { note: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClampable, setIsClampable] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      if (!isExpanded) {
        setIsClampable(el.scrollHeight > el.clientHeight);
      }
    }
  }, [note, isExpanded]);

  return (
    <div
      onClick={() => isClampable && setIsExpanded(!isExpanded)}
      className={`flex gap-3 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm ${
        isClampable ? "cursor-pointer select-none hover:bg-slate-50 transition-colors" : ""
      }`}
    >
      <MessageSquareQuote
        size={16}
        className="text-slate-300 shrink-0 mt-0.5"
      />
      <p
        ref={textRef}
        className={`text-[11px] text-slate-500 italic font-medium leading-relaxed ${
          isExpanded ? "" : "line-clamp-3"
        }`}
      >
        "{note}"
      </p>
    </div>
  );
};

const ModuleScoreCard = ({
  module,
  moduleStats,
  assessors,
  feedbacks,
}: {
  module: CompetenceMatrixModule;
  moduleStats: AssessmentModuleStatistics | undefined;
  assessors: Assessor[];
  feedbacks: IndividualAssessmentScore[];
}) => {
  if (!moduleStats) {
    return null;
  }

  const averagePoints = moduleStats.stats.averageScore.toFixed(1);
  const weight = moduleStats.stats.weight;
  const weightedPoints = moduleStats.stats.weightedScore.toFixed(2);

  // Derive notes for all assessors (including self-feedback) from feedbacks
  const notes = feedbacks
    .map((feedback) => {
      const evalModule = feedback.modules.find((m) => m.moduleId === module.moduleId);
      const moduleNotes = evalModule?.topics
        .flatMap((t) => t.notes)
        .filter((note) => note !== undefined && note !== "") || [];
      return moduleNotes.length > 0
        ? `${feedback.assessor.fullname}: ${moduleNotes.join("; ")}`
        : undefined;
    })
    .filter((note): note is string => note !== undefined);

  return (
    <div className="relative group bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:bg-slate-50 hover:shadow-md transition-all duration-300">
      {/* Module Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-4">
          <h4 className="font-black text-slate-800 text-base tracking-tight mb-1.5">
            {module.moduleName}
          </h4>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {module.description}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-black text-slate-800">
              {averagePoints}
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase">
              / 5
            </span>
          </div>
          <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full mt-1 inline-block">
            {weightedPoints} points (weight: {weight}%)
          </div>
        </div>
      </div>

      {/* Stacked Assessor Bars */}
      <div className="space-y-4 mb-4">
        {assessors.map((assessor) => {
          const feedback = feedbacks.find((f) => f.assessor.fullname === assessor.name);
          const evalModule = feedback?.modules.find((m) => m.moduleId === module.moduleId);
          const nonZeroTopics = evalModule?.topics.filter((t) => t.score !== undefined && t.score !== 0) || [];
          const totalScore = nonZeroTopics.reduce((total, topic) => total + (topic.score ?? 0), 0);
          const scoredTopics = nonZeroTopics.length;
          const score = scoredTopics > 0 ? totalScore / scoredTopics : 0;
          return (
            <AssessorScoreBar
              key={assessor.name}
              assessor={assessor}
              score={score}
            />
          );
        })}
      </div>

      {/* Module Notes */}
      {notes.length > 0 && (
        <div className="mt-6 space-y-3">
          {notes.map((note, idx) => (
            <ModuleNote key={idx} note={note} />
          ))}
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
  matrix: CompetenceMatrix;
  assessment: AssessmentSession;
  statistics: AssessmentSessionStatistics;
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
              {assessment.details.candidate.fullname}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-lg">
                <ShieldCheck size={16} />
                {statistics.summary.proficiencyLevel && (
                  <>
                    <span>{statistics.summary.proficiencyLevel}</span>
                    <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  </>
                )}
                {assessment.details.profile.title}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Box size={14} />
                  {assessment.details.stack}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {assessment.details.date.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-indigo-600">
              {statistics.summary.totalScore.toFixed(1)}
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
              <AssessorBadge key={assessor.name} assessor={assessor} />
            ))}
          </div>
        </div>

        {/* Modules Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-start">
          {matrix.modules.map((module) => (
            <ModuleScoreCard
              key={module.moduleId}
              module={module}
              moduleStats={statistics.modules.find(
                (x) => x.moduleId === module.moduleId,
              )}
              assessors={assessors}
              feedbacks={assessment.feedbacks}
            />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};
