"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { AssessmentLibraryPage } from "@/views/AssessmentLibrary";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function LibraryRoute() {
  const mounted = useMounted();

  const { matrix, profiles, stacks, levelMappings } = useAssessment();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">
          Loading library...
        </div>
      </div>
    );
  }

  return (
    <AssessmentLibraryPage
      matrix={matrix}
      profiles={profiles}
      stacks={stacks}
      levelMappings={levelMappings}
    />
  );
}
