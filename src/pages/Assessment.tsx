import { useState, useMemo, useEffect } from "react";
import { Save, CheckCircle, FileText, Library, ArrowLeft } from "lucide-react";
import type { Module, AssessmentSession } from "../types";
import { AssessmentStats } from "../components/assessment/AssessmentStats";
import { AssessmentModule } from "../components/assessment/AssessmentModule";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";

interface AssessmentProps {
  session: AssessmentSession;
  matrix: Module[];
  onUpdate: (data: Partial<AssessmentSession>) => void;
}

export const Assessment = ({ session, matrix, onUpdate }: AssessmentProps) => {
  const navigate = useNavigate();
  // Initialize with first module expanded if available
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );

  // Initialize defaults when data loads
  useEffect(() => {
    if (matrix.length > 0 && expandedModules.size === 0) {
      setExpandedModules(new Set([matrix[0].id]));
    }
  }, [matrix, expandedModules]);

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
      onUpdate({ status: "completed" });
    }
  };

  // Calculations
  const stats = useMemo(() => {
    let totalScore = 0;
    let maxPossible = 0;
    let completedCount = 0;
    let totalTopics = 0;

    const moduleStats = matrix.map((mod) => {
      let modScore = 0;
      let modMax = 0;
      let modCompleted = 0;

      mod.topics.forEach((t) => {
        totalTopics++;
        modMax += 5 * (t.weight || 1); // Default weight 1 if missing
        if (session.scores[t.id] !== undefined) {
          modScore += session.scores[t.id] * (t.weight || 1);
          modCompleted++;
          completedCount++;
        }
      });

      totalScore += modScore;
      maxPossible += modMax;

      return {
        id: mod.id,
        score: modScore,
        max: modMax,
        percentage: modMax > 0 ? Math.round((modScore / modMax) * 100) : 0,
        completed: modCompleted,
        total: mod.topics.length,
      };
    });

    const overallPercentage =
      maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

    return {
      totalScore,
      maxPossible,
      overallPercentage,
      completedCount,
      totalTopics,
      moduleStats,
    };
  }, [session.scores, matrix]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 font-semibold group"
          >
            <div className="p-1 rounded-full group-hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} />
            </div>
            <span>Back to Dashboard</span>
          </button>
          <button
            onClick={() => navigate("/library")}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
          >
            <Library size={18} />
            <span>View Library</span>
          </button>
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
          {matrix.map((module) => {
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
              disabled={session.status === "completed"}
              onClick={finishAssessment}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg active:scale-95"
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
