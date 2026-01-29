import { useState } from "react";
import {
  CheckCircle,
  FileText,
  Library,
  ArrowLeft,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import type { Module, AssessorEvaluation, Profile } from "../types";
import { AssessmentStats } from "../components/assessment/AssessmentStats";
import { AssessmentModule } from "../components/assessment/AssessmentModule";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";
import {
  exportSessionToJSON,
  exportAssessmentToCSV,
} from "../utils/fileHelpers";
import { AssessmentHelper } from "../utils/assessmentHelper";

interface AssessorEvaluationPageProps {
  evaluation: AssessorEvaluation;
  modules: Module[];
  profile: Profile;
  onUpdate: (data: Partial<AssessorEvaluation>) => void;
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
        finalScore: stats.totalScore,
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
  const calculator = new AssessmentHelper(evaluation, modules, profile);
  const result = calculator.calculate();

  const moduleStats = modules.map((mod) => {
    const s = result.moduleScores[mod.id];
    return {
      id: mod.id,
      score: s.rawSum,
      max: s.totalTopics * 5, // Keep for legacy usage if needed
      average: s.averageScore,
      weight: s.weight,
      roleScore: s.weightedScore,
      completed: s.completedTopics,
      total: s.totalTopics,
      // Calculate a percentage for the UI progress bar (coverage of topics scored)
      percentage:
        s.totalTopics > 0
          ? Math.round((s.completedTopics / s.totalTopics) * 100)
          : 0,
    };
  });

  const stats = {
    totalScore: result.totalScore,
    completedCount: result.completedCount,
    totalTopics: result.totalTopics,
    moduleStats,
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

        <AssessmentStats
          candidateName={evaluation.candidateName}
          selectedProfileTitle={evaluation.profileTitle}
          selectedStack={evaluation.stack}
          stats={stats}
          onReset={resetAssessment}
        />

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const moduleStats = stats.moduleStats.find(
              (stats) => stats.id === module.id,
            );

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
              {stats.completedCount === stats.totalTopics
                ? "Assessment Ready for Submission"
                : `${stats.totalTopics - stats.completedCount} Topics Remaining`}
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

      {/* Styles for print */}
      <style>{`
        @media print {
          body { background: white; }
          .max-w-5xl { max-width: 100%; }
          button, footer { display: none !important; }
          .bg-slate-50 { background-color: transparent !important; }
          .rounded-2xl { border: 1px solid #e2e8f0; border-radius: 4px; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};
