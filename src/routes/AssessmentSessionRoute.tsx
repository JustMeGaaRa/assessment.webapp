import { useEffect } from "react";
import {
  useParams,
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import { type PeerSessionState } from "../hooks/usePeerSession";
import { AssessmentSessionPage } from "../views/AssessmentSession";
import {
  AssessmentSession,
  CompetenceMatrix,
  ProficiencyLevel,
  Profile,
  IndividualAssessmentScore,
} from "../lib/matrix/types";

interface AssessmentSessionRouteProps {
  assessments: AssessmentSession[];
  matrix: CompetenceMatrix;
  profiles: Profile[];
  assessorName: string;

  hostedSessionId: string | null;
  setHostedSessionId: (id: string | null) => void;
  hostSession: PeerSessionState;

  guestHostId: string | null;
  setGuestHostId: (id: string | null) => void;
  guestSession: PeerSessionState;
  setGuestAssessmentId: (id: string | null) => void;

  levelMappings?: ProficiencyLevel[];
  onCreateAssessment: (assessment: AssessmentSession) => void;
  onCreateEvaluation: (assessmentId: string, evaluation: IndividualAssessmentScore) => void;
  onUpdateAssessment: (
    id: string,
    data: Partial<AssessmentSession>,
  ) => void;
  onDeleteEvaluation: (assessmentId: string, evaluationId: string) => void;
}

export const AssessmentSessionRoute = ({
  assessments,
  matrix,
  profiles,
  assessorName,
  levelMappings,
  hostedSessionId,
  hostSession,
  guestHostId,
  setGuestHostId,
  guestSession,
  setGuestAssessmentId,
  onCreateAssessment,
  onCreateEvaluation,
  onUpdateAssessment,
  onDeleteEvaluation,
  setHostedSessionId,
}: AssessmentSessionRouteProps) => {
  const params = useParams();
  const assessmentId = params?.assessmentId as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const assessment = assessments.find((a) => a.assessmentId === assessmentId);
  const sessionIdParam = searchParams?.get("s");

  const isGuestView = !!sessionIdParam;
  const isActivelyHostingThis = hostedSessionId === assessmentId;

  // Decide which session interface to use
  const activeSession = !isGuestView ? hostSession : guestSession;

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
  useEffect(() => {
    if (
      isGuestView &&
      sessionIdParam &&
      guestSession.status === "disconnected" &&
      assessorName &&
      !guestSession.error &&
      !guestHostId
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
      const current = new URLSearchParams(
        Array.from(searchParams?.entries() || []),
      );
      current.delete("s");
      router.replace(
        `${pathname}${current.toString() ? `?${current.toString()}` : ""}`,
      );
      setGuestHostId(null);
      setGuestAssessmentId(null);
    }
  }, [
    guestSession.error,
    searchParams,
    router,
    pathname,
    setGuestHostId,
    setGuestAssessmentId,
  ]);

  const handleCreateEvaluation = (ev: IndividualAssessmentScore) => {
    onCreateEvaluation(assessmentId, ev);
    activeSession.sendUpdateEvaluation(assessmentId, ev);
  };

  const handleDeleteEvaluation = (evaluationId: string) => {
    onDeleteEvaluation(assessmentId, evaluationId);
    activeSession.sendDeleteEvaluation?.(assessmentId, evaluationId);
  };

  const handleUpdateAssessment = (
    id: string,
    data: Partial<AssessmentSession>,
  ) => {
    onUpdateAssessment(id, data);
    activeSession.sendUpdateAssessment(id, data.details || {});
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

    const current = new URLSearchParams(
      Array.from(searchParams?.entries() || []),
    );
    current.delete("s");
    router.replace(
      `${pathname}${current.toString() ? `?${current.toString()}` : ""}`,
    );
  };

  const profile = assessment
    ? profiles.find((p) => p.profileId === assessment.details.profile.profileId)
    : undefined;

  const sessionMatrix: CompetenceMatrix = {
    modules: profile
      ? matrix.modules.filter(
          (m) =>
            (profile.modules.find((pm) => pm.moduleId === m.moduleId)?.weight ??
              0) > 0,
        )
      : [],
    stacks: matrix.stacks,
  };

  const assessmentEvaluations = assessment?.feedbacks || [];

  if (!assessment || !profile) return null;

  return (
    <AssessmentSessionPage
      assessment={assessment}
      evaluations={assessmentEvaluations}
      onCreateAssessment={onCreateAssessment}
      onCreateEvaluation={handleCreateEvaluation}
      onUpdateAssessment={handleUpdateAssessment}
      onDeleteEvaluation={handleDeleteEvaluation}
      matrix={sessionMatrix}
      profile={profile}
      assessorName={assessorName}
      levelMappings={levelMappings}
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
