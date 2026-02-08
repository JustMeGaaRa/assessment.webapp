import { useState } from "react";
import { useParams } from "react-router-dom";
import { type PeerSessionState, usePeerSession } from "../hooks/usePeerSession";
import { AssessmentSessionPage } from "../pages/AssessmentSession";
import type {
  AssessmentSessionState,
  AssessorEvaluationState,
  ModuleState,
  ProfileState,
} from "../types";

interface AssessmentSessionRouteProps {
  assessments: AssessmentSessionState[];
  evaluations: AssessorEvaluationState[];
  matrix: ModuleState[];
  profiles: ProfileState[];
  stacks: Record<string, string>;
  assessorName: string;
  hostedSessionId: string | null;
  hostSession: PeerSessionState;
  onCreateAssessment: (assessment: AssessmentSessionState) => void;
  onCreateEvaluation: (evaluation: AssessorEvaluationState) => void;
  onUpdateAssessment: (
    id: string,
    data: Partial<AssessmentSessionState>,
  ) => void;
  setHostedSessionId: (id: string | null) => void;
}

export const AssessmentSessionRoute = ({
  assessments,
  evaluations,
  matrix,
  profiles,
  assessorName,
  hostedSessionId,
  hostSession,
  onCreateAssessment,
  onCreateEvaluation,
  onUpdateAssessment,
  setHostedSessionId,
}: AssessmentSessionRouteProps) => {
  const { assessmentId } = useParams();
  const assessment = assessments.find((a) => a.id === assessmentId);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const isHosting = hostedSessionId === assessmentId;

  // Guest Session Hook
  // Only connect if we are NOT hosting this session AND we explicitly enabled guest mode.
  const guestSession: PeerSessionState = usePeerSession({
    sessionId: isHosting ? "" : assessmentId || "",
    assessorName,
    currentAssessment: assessment,
    enabled: isGuestMode,
    currentEvaluations: evaluations.filter(
      (e) => e.assessmentId === assessmentId,
    ),
    onSyncReceived: (
      syncedAssessment: AssessmentSessionState,
      syncedEvaluations: AssessorEvaluationState[],
    ) => {
      if (syncedAssessment && !assessment) {
        onCreateAssessment(syncedAssessment);
      }
      syncedEvaluations.forEach((ev) => onCreateEvaluation(ev));
    },
    onEvaluationReceived: (ev: AssessorEvaluationState) =>
      onCreateEvaluation(ev),
    onAssessmentUpdateReceived: (update: Partial<AssessmentSessionState>) => {
      if (assessmentId) onUpdateAssessment(assessmentId, update);
    },
  });

  // Decide which session interface to use
  const activeSession = isHosting ? hostSession : guestSession;

  const handleCreateEvaluation = (ev: AssessorEvaluationState) => {
    onCreateEvaluation(ev);
    activeSession.sendUpdateEvaluation(ev);
  };

  const handleUpdateAssessment = (
    id: string,
    data: Partial<AssessmentSessionState>,
  ) => {
    onUpdateAssessment(id, data);
    activeSession.sendUpdateAssessment(data);
  };

  const profile = assessment
    ? profiles.find((p) => p.id === assessment.profileId)
    : undefined;

  const profileModules = profile
    ? matrix.filter((m) => profile.weights[m.id] > 0)
    : [];

  const assessmentEvaluations = evaluations.filter(
    (evaluation) => evaluation.assessmentId === assessmentId,
  );

  return (
    <AssessmentSessionPage
      assessment={assessment}
      evaluations={assessmentEvaluations}
      onCreateAssessment={onCreateAssessment}
      onCreateEvaluation={handleCreateEvaluation}
      onUpdateAssessment={handleUpdateAssessment}
      matrix={profileModules}
      profile={profile}
      assessorName={assessorName}
      isOnline={isHosting}
      onStartSession={() => setHostedSessionId(assessmentId || null)}
      onEndSession={() => setHostedSessionId(null)}
      onJoinSession={() => setIsGuestMode(true)}
      onLeaveSession={() => setIsGuestMode(false)}
      isGuestMode={isGuestMode}
      activePeers={activeSession.activePeers}
      isConnected={activeSession.isConnected}
    />
  );
};
