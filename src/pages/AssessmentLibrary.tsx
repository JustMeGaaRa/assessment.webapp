import { useState } from "react";
import { ArrowLeft, Book, Check } from "lucide-react";
import type { ModuleState, ProfileState } from "../types";
import { LibraryTabs } from "../components/library/LibraryTabs";
import { LibraryModule } from "../components/library/LibraryModule";
import { LibraryProfile } from "../components/library/LibraryProfile";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";

interface AssessmentLibraryPageProps {
  matrix: ModuleState[];
  profiles: ProfileState[];
  stacks: Record<string, string>;
}

export const AssessmentLibraryPage = ({
  matrix,
  profiles,
  stacks,
}: AssessmentLibraryPageProps) => {
  const navigate = useNavigate();
  // Default to first stack available or empty string
  const [activeStack, setActiveStack] = useState(Object.values(stacks)[0]);
  const [activeTab, setActiveTab] = useState<"modules" | "profiles">("modules");

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
        </div>
        <PageHeader
          icon={<Book className="text-indigo-600 w-8 h-8" />}
          title="Assessment Library"
          description="Standard technical competencies defined for each technology stack."
        />

        <LibraryTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        {activeTab === "modules" ? (
          <div className="space-y-8">
            {/* Tech Stack Selection */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">
                Select Technology Stack
              </span>
              <div className="relative">
                <div
                  className="flex overflow-x-auto gap-2 py-4 -mx-4 px-4 items-center hide-scrollbar"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {Object.values(stacks).map((s) => (
                    <button
                      key={s}
                      onClick={() => setActiveStack(s)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                        activeStack === s
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30"
                      }`}
                    >
                      {activeStack === s && (
                        <Check
                          size={16}
                          strokeWidth={3}
                          className="text-white"
                        />
                      )}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {matrix.map((module) => (
                <LibraryModule
                  key={module.id}
                  module={module}
                  activeStack={activeStack}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profiles
              //   .filter((p) => p.stack === activeStack)
              .map((profile) => (
                <LibraryProfile
                  key={profile.id}
                  profile={profile}
                  matrix={matrix}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
