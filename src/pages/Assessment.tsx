import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  CheckCircle2,
  Save,
  RotateCcw,
  Trophy,
  Library,
  User,
  Layers,
  FileText,
} from "lucide-react";
import { ASSESSMENT_MATRIX, STACKS } from "../data";
import { StatCard } from "../components/StatCard";

interface AssessmentProps {
  scores: Record<string, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  notes: Record<string, string>;
  setNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  candidateName: string;
  setCandidateName: (name: string) => void;
}

export const Assessment = ({
  scores,
  setScores,
  notes,
  setNotes,
  candidateName,
  setCandidateName,
}: AssessmentProps) => {
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState(new Set(["mod-core"]));
  const [selectedStack, setSelectedStack] = useState(STACKS.DOTNET);

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

    const moduleStats = ASSESSMENT_MATRIX.map((mod) => {
      let modScore = 0;
      let modMax = 0;
      let modCompleted = 0;

      mod.topics.forEach((t) => {
        totalTopics++;
        modMax += 5 * t.weight;
        if (scores[t.id] !== undefined) {
          modScore += scores[t.id] * t.weight;
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
  }, [scores]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10">
          <button
            onClick={() => navigate("/library")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-semibold"
          >
            <Library size={18} />
            <span>View Matrix Library</span>
          </button>

          <div>
            <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
              <FileText className="text-indigo-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
              Technical Assessment
            </h1>
            <p className="text-slate-500 font-medium">
              Evaluate candidate technical competencies
            </p>
          </div>
        </header>

        {/* Global Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {/* 1. Candidate Name */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg">
              <User size={20} className="text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Candidate
              </p>
              <input
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 placeholder:font-normal placeholder:text-slate-300 text-sm truncate"
                placeholder="Enter Name..."
              />
            </div>
          </div>

          {/* 2. Active Stack */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg">
              <Layers size={20} className="text-indigo-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Tech Stack
              </p>
              <select
                value={selectedStack}
                onChange={(e) => setSelectedStack(e.target.value)}
                className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-sm -ml-1"
              >
                {Object.values(STACKS).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Progress */}
          <StatCard
            icon={<CheckCircle2 className="text-emerald-500" size={20} />}
            label="Progress"
            value={`${stats.completedCount} / ${stats.totalTopics}`}
          />

          {/* 4. Total Points */}
          <StatCard
            icon={<Trophy className="text-amber-500" size={20} />}
            label="Total Points"
            value={stats.totalScore}
          />

          {/* 5. Reset */}
          <button
            onClick={resetAssessment}
            className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 transition-all shadow-sm group"
          >
            <RotateCcw
              size={18}
              className="text-slate-400 group-hover:text-red-500 transition-colors"
            />
            <span className="font-semibold text-sm">Reset</span>
          </button>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {ASSESSMENT_MATRIX.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const mStat = stats.moduleStats.find((s) => s.id === module.id);

            return (
              <div
                key={module.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Module Header */}
                <div
                  className={`p-5 flex items-center gap-4 cursor-pointer select-none hover:bg-slate-50 transition-colors ${
                    isExpanded ? "bg-slate-50/50 border-b border-slate-100" : ""
                  }`}
                  onClick={() => toggleModule(module.id)}
                >
                  <div
                    className={`transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    <ChevronRight className="text-slate-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-bold text-slate-800">
                        {module.title}
                      </h2>
                      {mStat && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">
                          {mStat.completed} / {mStat.total}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 hidden md:block">
                      {module.description}
                    </p>
                  </div>

                  {mStat && (
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-sm font-bold ${
                          mStat.percentage > 70
                            ? "text-emerald-600"
                            : mStat.percentage > 40
                              ? "text-amber-600"
                              : "text-slate-400"
                        }`}
                      >
                        {mStat.percentage}%
                      </span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            mStat.percentage > 70
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${mStat.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Module Topics (Expanded View) */}
                {isExpanded && (
                  <div className="p-0 animate-in fade-in slide-in-from-top-2 duration-200">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                        <tr>
                          <th className="px-6 py-3 w-1/2">
                            Topic & Discussion Points
                          </th>
                          <th className="px-6 py-3 text-right">
                            Scoring (0-5)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {module.topics.map((topic) => (
                          <tr
                            key={topic.id}
                            className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-700 mb-1 flex flex-col">
                                <span className="text-base">{topic.name}</span>
                                {topic.mappings &&
                                  topic.mappings[selectedStack] && (
                                    <span className="text-indigo-600 text-sm font-bold mt-0.5 flex items-center gap-1.5">
                                      {topic.mappings[selectedStack]}
                                    </span>
                                  )}
                              </div>
                              <input
                                type="text"
                                placeholder="Add specific observation..."
                                className="w-full text-xs text-slate-500 bg-transparent border-none focus:ring-0 p-0 placeholder:italic"
                                value={notes[topic.id] || ""}
                                onChange={(e) =>
                                  handleNote(topic.id, e.target.value)
                                }
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-1">
                                {[0, 1, 2, 3, 4, 5].map((num) => (
                                  <button
                                    key={num}
                                    onClick={() => handleScore(topic.id, num)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border
                                      ${
                                        scores[topic.id] === num
                                          ? "bg-indigo-600 text-white border-indigo-600 scale-110 shadow-md"
                                          : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                      }`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
