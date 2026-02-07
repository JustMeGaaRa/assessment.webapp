import { Box, Users, BarChart } from "lucide-react";

interface LibraryTabsProps {
  activeTab: "modules" | "profiles" | "levels";
  onTabChange: (tab: "modules" | "profiles" | "levels") => void;
}

export const LibraryTabs = ({ activeTab, onTabChange }: LibraryTabsProps) => {
  return (
    <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto">
      <button
        onClick={() => onTabChange("modules")}
        className={`pb-4 px-2 text-sm font-bold transition-colors relative whitespace-nowrap ${
          activeTab === "modules"
            ? "text-indigo-600"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <div className="flex items-center gap-2">
          <Box size={18} /> Modules & Topics
        </div>
        {activeTab === "modules" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
        )}
      </button>
      <button
        onClick={() => onTabChange("profiles")}
        className={`pb-4 px-2 text-sm font-bold transition-colors relative whitespace-nowrap ${
          activeTab === "profiles"
            ? "text-indigo-600"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <div className="flex items-center gap-2">
          <Users size={18} /> Profiles
        </div>
        {activeTab === "profiles" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
        )}
      </button>
      <button
        onClick={() => onTabChange("levels")}
        className={`pb-4 px-2 text-sm font-bold transition-colors relative whitespace-nowrap ${
          activeTab === "levels"
            ? "text-indigo-600"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <div className="flex items-center gap-2">
          <BarChart size={18} /> Level Scores
        </div>
        {activeTab === "levels" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
        )}
      </button>
    </div>
  );
};
