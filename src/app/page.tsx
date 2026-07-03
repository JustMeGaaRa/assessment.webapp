"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { HomePage } from "@/views/Home";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function HomeRoute() {
  const mounted = useMounted();

  const {
    assessments,
    createAssessment,
    handleDataLoad,
    stacks,
    profiles,
    matrix,
    levelMappings,
    assessorName,
    setAssessorName,
    restoreApplicationState,
    backupApplicationState,
    hostedSessionId,
    guestAssessmentId,
    guestHostId,
  } = useAssessment();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <HomePage
      assessments={assessments}
      onCreateAssessment={createAssessment}
      onDataLoad={handleDataLoad}
      existingStacks={stacks}
      existingProfiles={profiles}
      existingMatrix={matrix}
      existingLevelMappings={levelMappings}
      hasData={
        matrix.modules.length > 0 &&
        assessorName !== "" &&
        assessorName !== undefined
      }
      assessorName={assessorName}
      setAssessorName={setAssessorName}
      onRestore={restoreApplicationState}
      onBackup={backupApplicationState}
      hostedSessionId={hostedSessionId}
      guestAssessmentId={guestAssessmentId}
      guestHostId={guestHostId}
    />
  );
}
