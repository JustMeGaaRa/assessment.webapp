import type {
  AssessmentSession,
  Profile,
} from "../../lib/matrix/types";
import { AssessmentSessionCard } from "../dashboard/AssessmentSessionCard";

interface OngoingAssessmentsSectionProps {
  assessments: AssessmentSession[];
  profiles: Profile[];
  hostedSessionId?: string | null;
  guestAssessmentId?: string | null;
  guestHostId?: string | null;
}

export const OngoingAssessmentsSection = ({
  assessments,
  profiles,
  hostedSessionId,
  guestAssessmentId,
  guestHostId,
}: OngoingAssessmentsSectionProps) => {
  const ongoing = assessments.filter(
    (a) => a.assessmentId === hostedSessionId || a.assessmentId === guestAssessmentId,
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
          const isHosted = assessment.assessmentId === hostedSessionId;
          const hostId =
            !isHosted && guestAssessmentId
              ? guestHostId || undefined
              : undefined;

          return (
            <AssessmentSessionCard
              key={assessment.assessmentId}
              assessment={assessment}
              hostId={hostId}
              profiles={profiles}
            />
          );
        })}
      </div>
    </div>
  );
};
