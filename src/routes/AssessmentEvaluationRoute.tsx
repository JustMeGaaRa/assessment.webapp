import { Navigate, useParams } from "react-router-dom";
import { usePeerSession } from "../hooks/usePeerSession";
import { AssessorEvaluationPage } from "../pages/AssessorEvaluation";
import type {
  AssessmentSessionState,
  AssessorEvaluationState,
  ModuleState,
  ProfileState,
} from "../types";

export interface AssessmentEvaluationRouteProps {
  evaluations: AssessorEvaluationState[];
  matrix: ModuleState[];
  profiles: ProfileState[];
  assessorName: string;
  onUpdateEvaluation: (
    id: string,
    data: Partial<AssessorEvaluationState>,
  ) => void;
  onCreateEvaluation: (evaluation: AssessorEvaluationState) => void;
}

export const AssessmentEvaluationRoute = ({
  evaluations,
  matrix,
  profiles,
  assessorName,
  onUpdateEvaluation,
  onCreateEvaluation,
}: AssessmentEvaluationRouteProps) => {
  const { evaluationId } = useParams();
  const evaluation = evaluations.find((s) => s.id === evaluationId);

  const { sendUpdateEvaluation } = usePeerSession({
    sessionId: evaluation?.assessmentId || "",
    currentEvaluations: evaluations,
    onSyncReceived: (
      _syncAssessment: AssessmentSessionState,
      syncEvaluations: AssessorEvaluationState[],
    ) => {
      // Upsert synced evaluations
      syncEvaluations.forEach((ev) => onCreateEvaluation(ev));
    },
    onEvaluationReceived: (ev: AssessorEvaluationState) => {
      onCreateEvaluation(ev);
    },
    onAssessmentUpdateReceived: () => {
      // Do nothing for assessment props updates here
    },
    assessorName,
  });

  if (!evaluation) {
    return <Navigate to="/" replace />;
  }

  const profile = profiles.find((p) => p.id === evaluation.profileId);

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const profileModules = matrix.filter((m) => profile.weights[m.id] > 0);

  return (
    <AssessorEvaluationPage
      evaluation={evaluation}
      modules={profileModules}
      profile={profile}
      onUpdate={(data) => {
        onUpdateEvaluation(evaluation.id, data);
        sendUpdateEvaluation({ ...evaluation, ...data });
      }}
    />
  );
};
