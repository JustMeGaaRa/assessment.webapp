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
  const statItems = [
    {
      icon: <User size={20} className="text-slate-400" />,
      label: "Candidate",
      value: candidateName,
    },
    {
      icon: <Layers size={20} className="text-indigo-500" />,
      label: "Profile",
      value: selectedProfileTitle,
    },
    {
      icon: <Layers size={20} className="text-indigo-500" />,
      label: "Tech Stack",
      value: selectedStack,
    },
    {
      icon: <CheckCircle2 className="text-emerald-500" size={20} />,
      label: "Progress",
      value: `${stats.completedCount} / ${stats.totalTopics}`,
    },
    {
      icon: <Trophy className="text-amber-500" size={20} />,
      label: "Score",
      value: stats.totalScore.toFixed(1),
    },
  ];

  return (
    <>
      {/* Mobile View: Unified Stacked Card */}
      <div className="md:hidden flex flex-col gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {statItems.map((item, index) => (
            <div key={index} className="p-3 flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  {item.label}
                </p>
                <p className="font-bold text-slate-700 text-sm truncate">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 transition-all shadow-sm group w-full"
        >
          <RotateCcw
            size={18}
            className="text-slate-400 group-hover:text-red-500 transition-colors"
          />
          <span className="font-semibold text-sm">Reset Assessment</span>
        </button>
      </div>

      {/* Desktop/Tablet View: Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statItems.map((item, index) => (
          <StatCard
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
          />
        ))}

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
    </>
  );
};
