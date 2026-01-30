import { User, Layers, Trophy, UserCheck, Calendar } from "lucide-react";
import { StatCard } from "../ui/StatCard";

interface AssessmentEvaluationStatsProps {
  candidate: string;
  assessorName: string;
  date: string;
  profile: string;
  stack: string;
  stats: {
    completedTopics: number;
    totalTopics: number;
    totalScore: number;
  };
}

export const AssessmentEvaluationStats = ({
  candidate,
  assessorName,
  date,
  profile,
  stack,
  stats,
}: AssessmentEvaluationStatsProps) => {
  const statItems = [
    {
      icon: <User size={20} className="text-slate-400" />,
      label: "Candidate",
      value: candidate,
    },
    {
      icon: <UserCheck size={20} className="text-emerald-500" />,
      label: "Assessor",
      value: assessorName,
    },
    {
      icon: <Layers size={20} className="text-indigo-500" />,
      label: "Profile",
      value: profile,
    },
    {
      icon: <Layers size={20} className="text-indigo-500" />,
      label: "Tech Stack",
      value: stack,
    },
    {
      icon: <Calendar size={20} className="text-slate-400" />,
      label: "Date",
      value: new Date(date).toLocaleDateString(),
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
      </div>
    </>
  );
};
