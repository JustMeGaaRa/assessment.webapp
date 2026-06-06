import type { AssessmentSessionState, AssessorEvaluationState } from "../../types";
import { AssessmentSessionCard } from "../dashboard/AssessmentSessionCard";

interface OngoingAssessmentsSectionProps {
  assessments: AssessmentSessionState[];
  hostedSessionId?: string | null;
  guestAssessmentId?: string | null;
  guestHostId?: string | null;
}

export const OngoingAssessmentsSection = ({
  assessments,
  hostedSessionId,
  guestAssessmentId,
  guestHostId,
}: OngoingAssessmentsSectionProps) => {
  const ongoing = assessments.filter(
    (a) => a.id === hostedSessionId || a.id === guestAssessmentId
  );

  if (ongoing.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Ongoing Assessment
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ongoing.map((assessment) => {
          const isHosted = assessment.id === hostedSessionId;
          const displaySession: AssessorEvaluationState = {
            id: assessment.id,
            assessmentId: assessment.id,
            candidateName: assessment.candidateName,
            profileTitle: assessment.profileTitle,
            profileId: assessment.profileId,
            stack: assessment.stack,
            date: assessment.date,
            status: "ongoing", // Force ongoing for active session
            scores: {},
            notes: {},
            finalScore: undefined,
            assessorName: isHosted ? "Your Session" : "Participating",
            hostId:
              !isHosted && guestAssessmentId
                ? guestHostId || undefined
                : undefined,
          };

          return (
            <AssessmentSessionCard
              key={assessment.id}
              session={displaySession}
            />
          );
        })}
      </div>
    </div>
  );
};
