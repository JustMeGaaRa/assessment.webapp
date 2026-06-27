"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { HomePage } from "@/views/Home";

export default function HomeRoute() {
  const {
    assessments,
    evaluations,
    createAssessment,
    createEvaluation,
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

  return (
    <HomePage
      assessments={assessments}
      evaluations={evaluations}
      onCreateAssessment={createAssessment}
      onCreateSession={createEvaluation}
      onDataLoad={handleDataLoad}
      existingStacks={stacks}
      existingProfiles={profiles}
      existingMatrix={matrix}
      existingLevelMappings={levelMappings}
      hasData={
        matrix.length > 0 &&
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
