import { Plus } from "lucide-react";
import type {
  AssessmentSessionState,
  AssessorFeedbackState,
  ProficiencyLevel,
} from "../../types";
import { ActionCard } from "../dashboard/ActionCard";
import { AssessmentSessionCard } from "../dashboard/AssessmentSessionCard";

interface AssessmentGridProps {
  displayAssessments: AssessmentSessionState[];
  evaluations: AssessorFeedbackState[];
  currentLevelMappings: ProficiencyLevel[];
  handleOpenSessionModal: () => void;
}

export const AssessmentGrid = ({
  displayAssessments,
  evaluations,
  currentLevelMappings,
  handleOpenSessionModal,
}: AssessmentGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ActionCard
        icon={<Plus size={24} />}
        title="New Assessment"
        description="Start a new evaluation session for a candidate"
        onClick={handleOpenSessionModal}
      />
      {displayAssessments.map((assessment) => {
        // Find evaluations for this assessment to compute status/score
        const relatedEvals = evaluations.filter(
          (e) => e.assessmentId === assessment.id,
        );
        const completed = relatedEvals.filter((e) => e.status === "completed");
        const isCompleted =
          relatedEvals.length > 0 &&
          relatedEvals.every((e) => e.status === "completed");
        // Compute average score
        const totalScore = completed.reduce(
          (acc, curr) => acc + (curr.finalScore || 0),
          0,
        );
        const avgScore =
          completed.length > 0 ? totalScore / completed.length : undefined;

        // Construct a display object compatible with AssessmentSessionCard
        // We treat 'locked' as a pseudo-status or just use ongoing/completed
        const displaySession: AssessorFeedbackState = {
          id: assessment.id, // Use Group ID as ID for navigation
          assessmentId: assessment.id, // It IS the assessment
          candidateName: assessment.candidateName,
          profileTitle: assessment.profileTitle,
          profileId: assessment.profileId,
          stack: assessment.stack,
          date: assessment.date,
          status: assessment.locked
            ? "completed"
            : isCompleted
              ? "completed"
              : "ongoing",
          scores: {},
          notes: {},
          finalScore: avgScore,
          assessorName: "Group", // Placeholder
        };

        return (
          <AssessmentSessionCard
            key={assessment.id}
            session={displaySession}
            levelMappings={currentLevelMappings}
          />
        );
      })}
    </div>
  );
};
