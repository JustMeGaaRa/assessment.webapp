"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { AssessmentEvaluationRoute } from "@/routes/AssessmentEvaluationRoute";

export default function AssessmentEvaluationRoutePage() {
  const {
    evaluations,
    matrix,
    profiles,
    updateEvaluation,
    assessorName,
    hostedSessionId,
    hostSession,
    guestHostId,
    guestSession,
  } = useAssessment();

  return (
    <AssessmentEvaluationRoute
      evaluations={evaluations}
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
