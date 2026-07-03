import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssessorEvaluationPage } from "../views/AssessorEvaluation";
import type { PeerSessionState } from "../hooks/usePeerSession";
import {
  AssessmentSession,
  CompetenceMatrix,
  Profile,
  IndividualAssessmentScore,
} from "../lib/matrix/types";

export interface AssessmentEvaluationRouteProps {
  assessments: AssessmentSession[];
  matrix: CompetenceMatrix;
  profiles: Profile[];
  assessorName: string;
  onUpdateEvaluation: (
    id: string,
    data: Partial<IndividualAssessmentScore>,
  ) => void;
  activeSession?: PeerSessionState;
}

export const AssessmentEvaluationRoute = ({
  assessments,
  matrix,
  profiles,
  assessorName,
  onUpdateEvaluation,
  activeSession,
}: AssessmentEvaluationRouteProps) => {
  const params = useParams();
  const assessmentId = params?.assessmentId as string;
  const evaluationId = params?.evaluationId as string;
  const router = useRouter();

  const assessment = assessments.find((a) => a.assessmentId === assessmentId);
  const evaluation = assessment?.feedbacks.find((s) => s.feedbackId === evaluationId);

  useEffect(() => {
    if (!evaluation) {
      router.replace("/");
    }
  }, [evaluation, router]);

  const profile = assessment
    ? profiles.find((p) => p.profileId === assessment.details.profile.profileId)
    : undefined;

  useEffect(() => {
    if (evaluation && !profile) {
      router.replace("/");
    }
  }, [evaluation, profile, router]);

  if (!assessment || !evaluation || !profile) {
    return null;
  }

  const sessionMatrix: CompetenceMatrix = {
    modules: matrix.modules.filter(
      (m) =>
        (profile.modules.find((pm) => pm.moduleId === m.moduleId)?.weight ??
          0) > 0,
    ),
    stacks: matrix.stacks,
  };

  const isSessionActive = activeSession?.status === "connected";
  const isMyEvaluation = evaluation.assessor.fullname === assessorName;

  // If session is active, and it's NOT my evaluation, it is locked.
  const isLocked = isSessionActive && !isMyEvaluation;

  const handleUpdate = (data: Partial<IndividualAssessmentScore>) => {
    onUpdateEvaluation(evaluation.feedbackId, data);
    if (activeSession?.status === "connected" && assessmentId) {
      activeSession.sendUpdateEvaluation(assessmentId, { ...evaluation, ...data });
    }
  };

  return (
    <AssessorEvaluationPage
      evaluation={evaluation}
      modules={sessionMatrix}
      profile={profile}
      onUpdate={handleUpdate}
      isLocked={isLocked}
      candidateName={assessment.details.candidate.fullname}
      stack={assessment.details.stack}
    />
  );
};
