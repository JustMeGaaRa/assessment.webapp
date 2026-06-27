import { useState } from "react";
import {
  CheckCircle,
  FileText,
  Library,
  ArrowLeft,
  Download,
  RotateCcw,
  Lock,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  ModuleState,
  AssessorFeedbackState,
  ProfileState,
} from "../types";
import { AssessmentEvaluationStats } from "../components/assessment/AssessmentStats";
import { AssessmentModule } from "../components/assessment/AssessmentModule";
import { PageHeader } from "../components/ui/PageHeader";
import { useRouter } from "next/navigation";
import { exportSessionToJSON } from "../utils/fileHelpers";
import {
  calculateAssessorFeedbackScore,
  getIndividualModuleScores,
} from "../lib/matrix/assessmentHelper";
import {
  dummySkillScores,
  scoreStyles,
} from "../components/library/skillScoresData";

interface AssessorEvaluationPageProps {
  evaluation: AssessorFeedbackState;
  modules: ModuleState[];
  profile: ProfileState;
  onUpdate: (data: Partial<AssessorFeedbackState>) => void;
  isLocked?: boolean;
}

export const AssessorEvaluationPage = ({
  evaluation,
  modules,
  profile,
  onUpdate,
  isLocked = false,
}: AssessorEvaluationPageProps) => {
  const router = useRouter();

  // Initialize with first module expanded if available
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    return modules.length > 0 ? new Set([modules[0].id]) : new Set();
  });
  const [showReference, setShowReference] = useState(true);

  const toggleModule = (id: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedModules(newSet);
  };

  const handleScore = (topicId: string, score: number) => {
    if (isLocked) return;
    onUpdate({
      scores: { ...evaluation.scores, [topicId]: score },
    });
  };

  const handleNote = (topicId: string, note: string) => {
    if (isLocked) return;
    onUpdate({
      notes: { ...evaluation.notes, [topicId]: note },
    });
  };

  const resetAssessment = () => {
    if (isLocked) return;
    if (window.confirm("Are you sure you want to clear all scores?")) {
      onUpdate({
        scores: {},
        notes: {},
      });
    }
  };

  const finishAssessment = () => {
    if (isLocked) return;
    if (window.confirm("Mark this assessment as completed?")) {
      onUpdate({
        status: "completed",
        finalScore: evaluationStats.totalScore,
      });
    }
  };

  // --- JSON Handlers ---
  const handleExportJSON = () => {
    exportSessionToJSON(evaluation);
  };

  // Calculations
  const getScoredTopicsInModule = (module: ModuleState) => {
    return module.topics.filter((topic) => evaluation.scores[topic.id] > 0)
      .length;
  };

  const feedbacks = getIndividualModuleScores(modules, evaluation);
  const stats = calculateAssessorFeedbackScore(
    profile,
    evaluation.assessorName ?? "Anonmyous",
    feedbacks,
  );
  const evaluationStats = {
    totalScore: stats.weightedScore,
    completedTopics: modules.reduce(
      (total, module) => total + getScoredTopicsInModule(module),
      0,
    ),
    totalTopics: modules.reduce(
      (total, module) => total + module.topics.length,
      0,
    ),
  };

  const isReadOnly =
    isLocked ||
    evaluation.status === "completed" ||
    evaluation.status === "rejected";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 pb-32 md:pb-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 font-semibold group"
            >
              <div className="p-1 rounded-full group-hover:bg-slate-100 transition-colors">
                <ArrowLeft size={20} />
              </div>
              <span className="hidden sm:inline">Back to Assessment</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Lock Indicator */}
            {isLocked && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold shadow-sm"
                title="You cannot edit this evaluation."
              >
                <Lock size={14} />
                <span>Read Only</span>
              </div>
            )}

            {/* JSON Export */}
            <div className="flex gap-1 items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-600 font-bold hover:text-indigo-600 transition-all text-xs"
                title="Export JSON Backup"
              >
                <Download size={14} />
                <span className="hidden sm:inline">JSON Export</span>
              </button>
            </div>

            <div className="w-px h-8 bg-slate-300 mx-1 hidden sm:block"></div>
            <button
              onClick={() => router.push("/library")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
            >
              <Library size={18} />
              <span className="hidden sm:inline">View Library</span>
            </button>
          </div>
        </div>
        <PageHeader
          icon={
            isLocked ? (
              <Lock className="text-amber-500 w-8 h-8" />
            ) : (
              <FileText className="text-indigo-600 w-8 h-8" />
            )
          }
          title="Assessment Evaluation"
          description={
            isLocked
              ? "Viewing peer assessment (Read Only)"
              : "Evaluate candidate technical competencies."
          }
        />

        <AssessmentEvaluationStats
          candidate={evaluation.candidateName}
          assessorName={evaluation.assessorName ?? "Unknown"}
          date={evaluation.date}
          profile={evaluation.profileTitle}
          stack={evaluation.stack}
          stats={evaluationStats}
        />

        {/* Skill Score Reference Rubric */}
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
          <button
            onClick={() => setShowReference(!showReference)}
            className="w-full flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Info size={18} className="text-indigo-600" />
              <span className="font-bold text-sm text-slate-700">
                Evaluation Rubric Reference
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
              <span>{showReference ? "Hide Reference" : "Show Reference"}</span>
              {showReference ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
          </button>

          {showReference && (
            <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
                {dummySkillScores.map((skill) => {
                  const style = scoreStyles[skill.score] || scoreStyles[1];
                  const Icon = style.icon;
                  return (
                    <div
                      key={skill.score}
                      className="border border-slate-100 rounded-xl p-3 bg-white flex flex-col relative overflow-hidden shadow-xs hover:shadow-sm transition-all group"
                    >
                      {/* Top Accent Gradient Bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.gradient}`}
                      />
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${style.badge}`}
                          >
                            {skill.score}
                          </span>
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {skill.label}
                          </span>
                        </div>
                        <span
                          className={`${style.text} opacity-60 group-hover:opacity-100 transition-opacity`}
                        >
                          <Icon size={12} />
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const completedTopics = getScoredTopicsInModule(module);
            const totalTopics = module.topics.length;
            const moduleStats = {
              moduleId: module.id,
              completed: completedTopics,
              total: totalTopics,
            };

            return (
              <AssessmentModule
                key={module.id}
                module={module}
                isExpanded={isExpanded}
                stats={moduleStats}
                onToggle={toggleModule}
                selectedStack={evaluation.stack}
                scores={evaluation.scores}
                notes={evaluation.notes}
                onScore={handleScore}
                onNote={handleNote}
                isReadOnly={isReadOnly}
              />
            );
          })}
        </div>

        {/* Action Bar - Floating - Only show if NOT locked, or maybe show simplified view? */}
        {!isLocked && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-8 pointer-events-none">
            <div className="max-w-7xl mx-auto pointer-events-auto">
              <footer className="flex justify-between p-6 bg-slate-800 rounded-2xl text-white shadow-2xl border border-slate-700/50 backdrop-blur-sm bg-slate-800/95">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <p className="text-slate-400 text-sm font-medium">
                      Final Evaluation Status
                    </p>
                  </div>
                  <h3 className="text-xl font-bold">
                    {evaluationStats.completedTopics ===
                    evaluationStats.totalTopics
                      ? "Assessment Ready for Submission"
                      : `${
                          evaluationStats.totalTopics -
                          evaluationStats.completedTopics
                        } Topics Remaining`}
                  </h3>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={
                      evaluation.status === "completed" ||
                      evaluation.status === "rejected"
                    }
                    onClick={resetAssessment}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:active:scale-100 border border-slate-600 flex items-center gap-2"
                    title="Reset Assessment"
                  >
                    <RotateCcw size={18} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>

                  <button
                    disabled={
                      evaluation.status === "completed" ||
                      evaluation.status === "rejected"
                    }
                    onClick={finishAssessment}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:active:scale-100 flex items-center gap-2"
                  >
                    <CheckCircle size={20} />
                    <span className="hidden sm:inline">
                      {evaluation.status === "completed"
                        ? "Completed"
                        : "Complete"}
                    </span>
                  </button>
                </div>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
