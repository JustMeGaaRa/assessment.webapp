import { Navigate, useParams } from "react-router-dom";
import { AssessorEvaluationPage } from "../pages/AssessorEvaluation";
import type { PeerSessionState } from "../hooks/usePeerSession";
import type {
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
  activeSession?: PeerSessionState;
}

export const AssessmentEvaluationRoute = ({
  evaluations,
  matrix,
  profiles,
  assessorName,
  onUpdateEvaluation,
  activeSession,
}: AssessmentEvaluationRouteProps) => {
  const { evaluationId } = useParams();
  const evaluation = evaluations.find((s) => s.id === evaluationId);

  if (!evaluation) {
    return <Navigate to="/" replace />;
  }

  const profile = profiles.find((p) => p.id === evaluation.profileId);

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const profileModules = matrix.filter((m) => profile.weights[m.id] > 0);

  // Locking Logic
  // If activeSession is present and connected:
  // - If evaluation.assessorName !== assessorName (and evaluation.assessorName exists), LOCK IT.
  // - If we are Host, maybe we can edit everything? Requirement: "users are only able to set scores in the assessment evaluation feedback that they created."
  // So even Host cannot edit others' scores in P2P mode.
  // Exception: If no active session, user can modify any.

  const isSessionActive = activeSession?.status === "connected";
  const isMyEvaluation = evaluation.assessorName === assessorName;

  // If session is active, and it's NOT my evaluation, it is locked.
  const isLocked = isSessionActive && !isMyEvaluation;

  // We also need to send updates if session is active
  const handleUpdate = (data: Partial<AssessorEvaluationState>) => {
    onUpdateEvaluation(evaluation.id, data);
    if (activeSession?.status === "connected") {
      activeSession.sendUpdateEvaluation({ ...evaluation, ...data });
    }
  };

  return (
    <AssessorEvaluationPage
      evaluation={evaluation}
      modules={profileModules}
      profile={profile}
      onUpdate={handleUpdate}
      isLocked={isLocked}
    />
  );
};
