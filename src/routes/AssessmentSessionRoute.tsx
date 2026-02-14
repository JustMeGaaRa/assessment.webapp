import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { type PeerSessionState } from "../hooks/usePeerSession";
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
  assessorName: string;

  hostedSessionId: string | null;
  setHostedSessionId: (id: string | null) => void;
  hostSession: PeerSessionState;

  guestHostId: string | null;
  setGuestHostId: (id: string | null) => void;
  guestSession: PeerSessionState;
  setGuestAssessmentId: (id: string | null) => void;

  onCreateAssessment: (assessment: AssessmentSessionState) => void;
  onCreateEvaluation: (evaluation: AssessorEvaluationState) => void;
  onUpdateAssessment: (
    id: string,
    data: Partial<AssessmentSessionState>,
  ) => void;
}

export const AssessmentSessionRoute = ({
  assessments,
  evaluations,
  matrix,
  profiles,
  assessorName,
  hostedSessionId,
  hostSession,
  guestHostId,
  setGuestHostId,
  guestSession,
  setGuestAssessmentId,
  onCreateAssessment,
  onCreateEvaluation,
  onUpdateAssessment,
  setHostedSessionId,
}: AssessmentSessionRouteProps) => {
  const { assessmentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const assessment = assessments.find((a) => a.id === assessmentId);
  const sessionIdParam = searchParams.get("s");

  const isGuestView = !!sessionIdParam;
  const isActivelyHostingThis = hostedSessionId === assessmentId;

  // Decide which session interface to use
  // If not a guest view (no ?s= param), we are the Host (or potential Host)
  const activeSession = !isGuestView ? hostSession : guestSession;

  // Determine display status
  // If we are a Host View, but not actively hosting THIS assessment, show disconnected
  // so the user can see the "Start Session" button.
  // If we are hosting another session, this will effectively allow overriding it.
  const displayStatus =
    !isGuestView && !isActivelyHostingThis
      ? "disconnected"
      : activeSession.status;

  const displayPeerId =
    !isGuestView && !isActivelyHostingThis
      ? undefined
      : isActivelyHostingThis
        ? hostSession.peerId
        : sessionIdParam || undefined;

  // Auto-join logic if we have the link and we are ready
  // Only auto-join if we are NOT the host, we have a session param, and we are not connected/connecting
  useEffect(() => {
    if (
      isGuestView &&
      sessionIdParam &&
      guestSession.status === "disconnected" &&
      assessorName &&
      !guestSession.error &&
      !guestHostId // Don't try to join if we think we are already joined/joining
    ) {
      guestSession.joinSession(sessionIdParam);
      setGuestHostId(sessionIdParam);
      if (assessmentId) setGuestAssessmentId(assessmentId);
    }
  }, [
    isGuestView,
    sessionIdParam,
    assessorName,
    guestSession,
    guestHostId,
    setGuestHostId,
    assessmentId,
    setGuestAssessmentId,
  ]);

  // Handle Session Closed by Host
  useEffect(() => {
    if (guestSession.error === "The session was closed by the host.") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("s");
      setSearchParams(newParams);
      // We also strictly ensure our local state is cleared, though App.tsx handles onSessionClosed
      setGuestHostId(null);
      setGuestAssessmentId(null);
    }
  }, [
    guestSession.error,
    searchParams,
    setSearchParams,
    setGuestHostId,
    setGuestAssessmentId,
  ]);

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

  const handleStartSession = async () => {
    await hostSession.startSession();
    setHostedSessionId(assessmentId || null);
  };

  const handleEndSession = () => {
    hostSession.stopSession();
    setHostedSessionId(null);
  };

  const handleJoinSession = () => {
    if (sessionIdParam) {
      guestSession.joinSession(sessionIdParam);
      setGuestHostId(sessionIdParam);
      if (assessmentId) setGuestAssessmentId(assessmentId);
    }
  };

  const handleLeaveSession = () => {
    guestSession.leaveSession();
    setGuestHostId(null);
    setGuestAssessmentId(null);

    // Remove the 's' parameter from URL to prevent auto-rejoin logic
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("s");
    setSearchParams(newParams);
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
      sessionStatus={displayStatus}
      sessionError={activeSession.error}
      activePeers={activeSession.activePeers}
      isHost={!isGuestView}
      hostPeerId={displayPeerId}
      onStartSession={handleStartSession}
      onEndSession={handleEndSession}
      onJoinSession={handleJoinSession}
      onLeaveSession={handleLeaveSession}
    />
  );
};
