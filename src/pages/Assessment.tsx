import { useState, useMemo, useEffect } from "react";
import { Save } from "lucide-react";
import type { Module } from "../types";
import { AssessmentHeader } from "../components/assessment/AssessmentHeader";
import { AssessmentStats } from "../components/assessment/AssessmentStats";
import { AssessmentModule } from "../components/assessment/AssessmentModule";

interface AssessmentProps {
  scores: Record<string, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  notes: Record<string, string>;
  setNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  candidateName: string;
  matrix: Module[];
  selectedStack: string;
  selectedProfileTitle: string;
}

export const Assessment = ({
  scores,
  setScores,
  notes,
  setNotes,
  candidateName,
  matrix,
  selectedStack,
  selectedProfileTitle,
}: AssessmentProps) => {
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
    setScores((prev) => ({ ...prev, [topicId]: score }));
  };

  const handleNote = (topicId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [topicId]: note }));
  };

  const resetAssessment = () => {
    if (window.confirm("Are you sure you want to clear all scores?")) {
      setScores({});
      setNotes({});
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
        if (scores[t.id] !== undefined) {
          modScore += scores[t.id] * (t.weight || 1);
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
  }, [scores, matrix]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AssessmentHeader />

        <AssessmentStats
          candidateName={candidateName}
          selectedProfileTitle={selectedProfileTitle}
          selectedStack={selectedStack}
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
                selectedStack={selectedStack}
                scores={scores}
                notes={notes}
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
          <button
            disabled={stats.completedCount === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg active:scale-95"
            onClick={() => window.print()}
          >
            <Save size={20} />
            Export Evaluation Report
          </button>
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
