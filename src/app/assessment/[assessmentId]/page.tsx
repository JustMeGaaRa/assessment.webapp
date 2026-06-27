"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { AssessmentSessionRoute } from "@/routes/AssessmentSessionRoute";

export default function AssessmentRoute() {
  const {
    assessments,
    evaluations,
    createAssessment,
    createEvaluation,
    updateAssessment,
    matrix,
    profiles,
    assessorName,
    levelMappings,
    hostedSessionId,
    setHostedSessionId,
    hostSession,
    guestHostId,
    setGuestHostId,
    guestSession,
    setGuestAssessmentId,
  } = useAssessment();

  return (
    <AssessmentSessionRoute
      assessments={assessments}
      evaluations={evaluations}
      onCreateAssessment={createAssessment}
      onCreateEvaluation={createEvaluation}
      onUpdateAssessment={updateAssessment}
      matrix={matrix}
      profiles={profiles}
      assessorName={assessorName}
      levelMappings={levelMappings}
      hostedSessionId={hostedSessionId}
      setHostedSessionId={setHostedSessionId}
      hostSession={hostSession}
      guestHostId={guestHostId}
      setGuestHostId={setGuestHostId}
      guestSession={guestSession}
      setGuestAssessmentId={setGuestAssessmentId}
    />
  );
}
