import { useRef, useState } from "react";
import {
  Save,
  CheckCircle,
  FileText,
  Library,
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import type { Module, AssessmentSession, Profile } from "../types";
import { AssessmentStats } from "../components/assessment/AssessmentStats";
import { AssessmentModule } from "../components/assessment/AssessmentModule";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";
import { AssessmentSummary } from "../utils/AssessmentSummary";
import {
  exportSessionToJSON,
  importSessionFromJSON,
  exportAssessmentToCSV,
  parseAssessmentCSV,
} from "../utils/fileHelpers";

interface AssessmentProps {
  session: AssessmentSession;
  modules: Module[];
  profile: Profile;
  onUpdate: (data: Partial<AssessmentSession>) => void;
}

export const Assessment = ({
  session,
  modules,
  profile,
  onUpdate,
}: AssessmentProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

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
      scores: { ...session.scores, [topicId]: score },
    });
  };

  const handleNote = (topicId: string, note: string) => {
    onUpdate({
      notes: { ...session.notes, [topicId]: note },
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
    exportSessionToJSON(session);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        "Importing will overwrite current session data. Continue?",
      )
    ) {
      e.target.value = ""; // Reset
      return;
    }

    importSessionFromJSON(file)
      .then((newSession) => {
        onUpdate({
          candidateName: newSession.candidateName,
          profileId: newSession.profileId,
          profileTitle: newSession.profileTitle,
          stack: newSession.stack,
          scores: newSession.scores,
          notes: newSession.notes,
          status: newSession.status,
        });
        alert("Assessment JSON imported successfully!");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to import JSON. Invalid file.");
      })
      .finally(() => {
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  // --- CSV Handlers ---
  const handleExportCSV = () => {
    exportAssessmentToCSV(session, modules);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        "Importing CSV will update scores and notes. Existing data will be merged/overwritten. Continue?",
      )
    ) {
      e.target.value = "";
      return;
    }

    parseAssessmentCSV(file)
      .then(({ scores: newScores, notes: newNotes }) => {
        // Merge with existing or overwrite
        onUpdate({
          scores: { ...session.scores, ...newScores },
          notes: { ...session.notes, ...newNotes },
        });
        alert("Assessment CSV scores imported successfully!");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to parse CSV file.");
      })
      .finally(() => {
        if (csvInputRef.current) csvInputRef.current.value = "";
      });
  };

  // Calculations

  const calculator = new AssessmentSummary(session, modules, profile);
  const result = calculator.calculate();

  // Map result back to UI requirements
  // We iterate matrix again just to preserve order, or we can use Object.values(result.moduleScores) if order doesn't matter (but it does for list)
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
              <span>Back to Dashboard</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleImportJSON}
            />
            <input
              type="file"
              ref={csvInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleImportCSV}
            />

            {/* JSON Group */}
            <div className="flex gap-1 items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-600 font-bold hover:text-indigo-600 transition-all text-xs"
                title="Import JSON Backup"
              >
                <Upload size={14} />
                <span className="hidden sm:inline">JSON</span>
              </button>
              <div className="w-px h-4 bg-slate-200"></div>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-600 font-bold hover:text-indigo-600 transition-all text-xs"
                title="Export JSON Backup"
              >
                <Download size={14} />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </div>

            {/* CSV Group */}
            <div className="flex gap-1 items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => csvInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-600 font-bold hover:text-emerald-600 transition-all text-xs"
                title="Import Scores CSV"
              >
                <FileSpreadsheet size={14} />
                <span className="hidden sm:inline">Import</span>
              </button>
              <div className="w-px h-4 bg-slate-200"></div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-600 font-bold hover:text-emerald-600 transition-all text-xs"
                title="Export Scores CSV"
              >
                <FileSpreadsheet size={14} />
                <span className="hidden sm:inline">Export</span>
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
          title="Assessment Session"
          description="Evaluate candidate technical competencies."
        />

        <AssessmentStats
          candidateName={session.candidateName}
          selectedProfileTitle={session.profileTitle}
          selectedStack={session.stack}
          stats={stats}
          onReset={resetAssessment}
        />

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const mStat = stats.moduleStats.find((s) => s.id === module.id);

            return (
              <AssessmentModule
                key={module.id}
                module={module}
                isExpanded={isExpanded}
                stats={mStat}
                onToggle={toggleModule}
                selectedStack={session.stack}
                scores={session.scores}
                notes={session.notes}
                onScore={handleScore}
                onNote={handleNote}
                isReadOnly={
                  session.status === "completed" ||
                  session.status === "rejected"
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
                session.status === "completed" || session.status === "rejected"
              }
              onClick={finishAssessment}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:active:scale-100"
            >
              <CheckCircle size={20} />
              {session.status === "completed" ? "Completed" : "Complete"}
            </button>

            <button
              disabled={stats.completedCount === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg active:scale-95"
              onClick={() => window.print()}
            >
              <Save size={20} />
              Export
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
