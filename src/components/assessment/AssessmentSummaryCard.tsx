import {
  MessageSquareQuote,
  TrendingUp,
  Calendar,
  Box,
  ShieldCheck,
} from "lucide-react";

import type { AssessorEvaluation, Module, Profile } from "../../types";
import { AssessmentHelper } from "../../utils/assessmentHelper";

export interface Assessor {
  id: string;
  name: string;
  color: string;
  text: string;
  light: string;
}

export interface AssessmentResult {
  id: string;
  candidateName: string;
  profileId: string;
  profileName: string;
  stack: string;
  date: string;
  assessors: Assessor[];
  evaluations: AssessorEvaluation[];
  scores: {
    [moduleId: string]: {
      [evaluationId: string]: number;
    };
  };
  notes: {
    [key: string]: string;
  };
}

export const AssessmentSummaryCard = ({
  result,
  profile,
  matrix,
}: {
  result: AssessmentResult;
  profile: Profile;
  matrix: Module[];
}) => {
  const profileModules = matrix.filter(
    (module) => profile.weights[module.id] > 0,
  );
  const assessment = {
    assessmentId: result.id,
    evaluations: result.evaluations.reduce(
      (ee, evaluation) => ({
        ...ee,
        [evaluation.id]: {
          evaluationId: evaluation.id,
          modules: profileModules.reduce(
            (mm, module) => ({
              ...mm,
              [module.id]: {
                moduleId: module.id,
                topics: module.topics.reduce(
                  (tt, topic) => ({
                    ...tt,
                    [topic.id]: {
                      topicId: topic.id,
                      score: evaluation.scores[topic.id],
                      notes: evaluation.notes,
                    },
                  }),
                  {},
                ),
              },
            }),
            {},
          ),
        },
      }),
      {},
    ),
  };

  const restructuredAssessment = AssessmentHelper.changeAssessmentStructure(
    matrix,
    profile,
    assessment,
  );
  const assessmentSummary =
    AssessmentHelper.calculateAssessmentScoreAcrossAssessors(
      profile,
      matrix,
      restructuredAssessment,
    );

  return (
    <div
      key={assessmentSummary.assessmentId}
      className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100%] -mr-10 -mt-10" />

      {/* Header: Candidate Name */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-4">
            {result.candidateName}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-lg">
              <ShieldCheck size={16} />
              {result.profileName}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Box size={14} />
                {result.stack}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {result.date}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-indigo-600">
            {assessmentSummary.totalScore.toFixed(1)}
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
          {result.assessors.map((assessor) => (
            <div
              key={assessor.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${assessor.light} ${assessor.text} border border-transparent shadow-sm`}
            >
              <div className={`w-2 h-2 rounded-full ${assessor.color}`} />
              {assessor.name}
            </div>
          ))}
        </div>
      </div>

      {/* Modules Performance List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-start">
        {matrix.map((mod) => {
          const averagePoints = (
            assessmentSummary.moduleScores[mod.id]?.averageScore ?? 0
          ).toFixed(1);
          const weight = assessmentSummary.moduleScores[mod.id]?.weight ?? 0;
          const weightedPoints = (
            assessmentSummary.moduleScores[mod.id]?.weightedScore ?? 0
          ).toFixed(2);

          return (
            <div
              key={mod.id}
              className="relative group bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:bg-slate-50 hover:shadow-md transition-all duration-300"
            >
              {/* Module Header Inside Box */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <h4 className="font-black text-slate-800 text-base tracking-tight mb-1.5">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {mod.description}
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
                {result.assessors.map((assessor) => {
                  const score =
                    assessmentSummary.moduleScores[mod.id]?.evaluationScores[
                      assessor.id
                    ]?.averageScore ?? 0;
                  const percentage = (score / 5) * 100;

                  return (
                    <div key={assessor.id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter w-24 truncate">
                          {assessor.name}
                        </span>
                        <span
                          className={`text-[11px] font-black ${assessor.text}`}
                        >
                          {score.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${assessor.color} rounded-full transition-all duration-1000 ease-out relative`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Module Notes */}
              {result.notes[mod.id] && (
                <div className="mt-6 flex gap-3 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <MessageSquareQuote
                    size={16}
                    className="text-slate-300 shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] text-slate-500 italic font-medium leading-relaxed">
                    "{result.notes[mod.id]}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100">
        <button className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3">
          <TrendingUp size={16} />
          Download Full Analytics Report
        </button>
      </div>
    </div>
  );
};
