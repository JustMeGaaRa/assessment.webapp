"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { AssessmentEvaluationRoute } from "@/routes/AssessmentEvaluationRoute";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function AssessmentEvaluationRoutePage() {
  const mounted = useMounted();

  const {
    assessments,
    matrix,
    profiles,
    updateEvaluation,
    assessorName,
    hostedSessionId,
    hostSession,
    guestHostId,
    guestSession,
  } = useAssessment();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">
          Loading evaluation...
        </div>
      </div>
    );
  }

  return (
    <AssessmentEvaluationRoute
      assessments={assessments}
      matrix={matrix}
      profiles={profiles}
      onUpdateEvaluation={updateEvaluation}
      assessorName={assessorName}
      activeSession={
        hostedSessionId
          ? hostSession
          : guestHostId
            ? guestSession
            : undefined
      }
    />
  );
}
