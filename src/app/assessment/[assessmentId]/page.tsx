"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { AssessmentSessionRoute } from "@/routes/AssessmentSessionRoute";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function AssessmentRoute() {
  const mounted = useMounted();

  const {
    assessments,
    createAssessment,
    createEvaluation,
    updateAssessment,
    deleteEvaluation,
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">
          Loading assessment...
        </div>
      </div>
    );
  }

  return (
    <AssessmentSessionRoute
      assessments={assessments}
      onCreateAssessment={createAssessment}
      onCreateEvaluation={createEvaluation}
      onUpdateAssessment={updateAssessment}
      onDeleteEvaluation={deleteEvaluation}
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
