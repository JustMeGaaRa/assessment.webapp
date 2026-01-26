import { useState } from "react";
import type { Module, Profile } from "../types";
import { LibraryHeader } from "../components/library/LibraryHeader";
import { LibraryTabs } from "../components/library/LibraryTabs";
import { LibraryModule } from "../components/library/LibraryModule";
import { LibraryProfile } from "../components/library/LibraryProfile";

interface MatrixLibraryProps {
  matrix: Module[];
  profiles: Profile[];
  stacks: Record<string, string>;
}

export const MatrixLibrary = ({
  matrix,
  profiles,
  stacks,
}: MatrixLibraryProps) => {
  // Default to first stack available or empty string
  const [activeStack, setActiveStack] = useState(Object.values(stacks)[0]);
  const [activeTab, setActiveTab] = useState<"modules" | "profiles">("modules");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <LibraryHeader
          stacks={stacks}
          activeStack={activeStack}
          onStackChange={setActiveStack}
        />

        <LibraryTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        {activeTab === "modules" ? (
          <div className="grid grid-cols-1 gap-6">
            {matrix.map((module) => (
              <LibraryModule
                key={module.id}
                module={module}
                activeStack={activeStack}
              />
            ))}
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
