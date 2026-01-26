import { User, Layers, CheckCircle2, Trophy, RotateCcw } from "lucide-react";
import { StatCard } from "../StatCard";

interface AssessmentStatsProps {
  candidateName: string;
  selectedProfileTitle: string;
  selectedStack: string;
  stats: {
    completedCount: number;
    totalTopics: number;
    totalScore: number;
  };
  onReset: () => void;
}

export const AssessmentStats = ({
  candidateName,
  selectedProfileTitle,
  selectedStack,
  stats,
  onReset,
}: AssessmentStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {/* 1. Candidate Name */}
      <StatCard
        icon={<User size={20} className="text-slate-400" />}
        label="Candidate"
        value={candidateName}
      />

      {/* 1.5 Profile */}
      <StatCard
        icon={<Layers size={20} className="text-indigo-500" />}
        label="Profile"
        value={selectedProfileTitle}
      />

      {/* 2. Active Stack */}
      <StatCard
        icon={<Layers size={20} className="text-indigo-500" />}
        label="Tech Stack"
        value={selectedStack}
      />

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
        onClick={onReset}
        className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 transition-all shadow-sm group"
      >
        <RotateCcw
          size={18}
          className="text-slate-400 group-hover:text-red-500 transition-colors"
        />
        <span className="font-semibold text-sm">Reset</span>
      </button>
    </div>
  );
};
