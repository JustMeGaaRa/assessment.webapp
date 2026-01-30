import { useState } from "react";
import {
  CheckCircle,
  FileText,
  Library,
  ArrowLeft,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import type {
  ModuleState,
  AssessorEvaluationState,
  ProfileState,
} from "../types";
import { AssessmentEvaluationStats } from "../components/assessment/AssessmentStats";
import { AssessmentModule } from "../components/assessment/AssessmentModule";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";
import {
  exportSessionToJSON,
  exportAssessmentToCSV,
} from "../utils/fileHelpers";
import { AssessmentHelper } from "../utils/assessmentHelper";
import { EvaluationStateHelper } from "../utils/evaluationStateHelper";

interface AssessorEvaluationPageProps {
  evaluation: AssessorEvaluationState;
  modules: ModuleState[];
  profile: ProfileState;
  onUpdate: (data: Partial<AssessorEvaluationState>) => void;
}

export const AssessorEvaluationPage = ({
  evaluation,
  modules,
  profile,
  onUpdate,
}: AssessorEvaluationPageProps) => {
  const navigate = useNavigate();

  // Initialize with first module expanded if available
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    return modules.length > 0 ? new Set([modules[0].id]) : new Set();
  });

  const toggleModule = (id: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedModules(newSet);
  };

  const handleScore = (topicId: string, score: number) => {
    onUpdate({
      scores: { ...evaluation.scores, [topicId]: score },
    });
  };

  const handleNote = (topicId: string, note: string) => {
    onUpdate({
      notes: { ...evaluation.notes, [topicId]: note },
    });
  };

  const resetAssessment = () => {
    if (window.confirm("Are you sure you want to clear all scores?")) {
      onUpdate({
        scores: {},
        notes: {},
      });
    }
  };

  const finishAssessment = () => {
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

  // --- CSV Handlers ---
  const handleExportCSV = () => {
    exportAssessmentToCSV(evaluation, modules);
  };

  // Calculations
  const getScoredTopicsInModule = (module: ModuleState) => {
    return module.topics.filter((topic) => evaluation.scores[topic.id] > 0)
      .length;
  };

  const moduleScores = EvaluationStateHelper.mapEvaluationToModuleScore(
    modules,
    evaluation,
  );
  const evaluationScore =
    AssessmentHelper.calculateEvaluationStatisticsPerAssessor(
      profile,
      evaluation.id,
      moduleScores,
    );
  const evaluationStats = {
    totalScore: evaluationScore.weightedScore,
    completedTopics: modules.reduce(
      (total, module) => total + getScoredTopicsInModule(module),
      0,
    ),
    totalTopics: modules.reduce(
      (total, module) => total + module.topics.length,
      0,
    ),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 font-semibold group"
            >
              <div className="p-1 rounded-full group-hover:bg-slate-100 transition-colors">
                <ArrowLeft size={20} />
              </div>
              <span>Back to Assessment</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
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

            {/* CSV Export */}
            <div className="flex gap-1 items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-600 font-bold hover:text-emerald-600 transition-all text-xs"
                title="Export Scores CSV"
              >
                <FileSpreadsheet size={14} />
                <span className="hidden sm:inline">CSV Export</span>
              </button>
            </div>

            <div className="w-px h-8 bg-slate-300 mx-1 hidden sm:block"></div>
            <button
              onClick={() => navigate("/library")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
            >
              <Library size={18} />
              <span>View Library</span>
            </button>
          </div>
        </div>
        <PageHeader
          icon={<FileText className="text-indigo-600 w-8 h-8" />}
          title="Assessment Evaluation"
          description="Evaluate candidate technical competencies."
        />

        <AssessmentEvaluationStats
          candidate={evaluation.candidateName}
          profile={evaluation.profileTitle}
          stack={evaluation.stack}
          stats={evaluationStats}
          onReset={resetAssessment}
        />

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
                isReadOnly={
                  evaluation.status === "completed" ||
                  evaluation.status === "rejected"
                }
              />
            );
          })}
        </div>

        {/* Action Bar */}
        <footer className="mt-12 mb-20 flex flex-col md:flex-row items-center justify-between p-6 bg-slate-800 rounded-2xl text-white shadow-xl">
          <div className="mb-4 md:mb-0">
            <p className="text-slate-400 text-sm font-medium">
              Final Evaluation Status
            </p>
            <h3 className="text-xl font-bold">
              {evaluationStats.completedTopics === evaluationStats.totalTopics
                ? "Assessment Ready for Submission"
                : `${evaluationStats.totalTopics - evaluationStats.completedTopics} Topics Remaining`}
            </h3>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button
              disabled={
                evaluation.status === "completed" ||
                evaluation.status === "rejected"
              }
              onClick={finishAssessment}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:active:scale-100"
            >
              <CheckCircle size={20} />
              {evaluation.status === "completed" ? "Completed" : "Complete"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
