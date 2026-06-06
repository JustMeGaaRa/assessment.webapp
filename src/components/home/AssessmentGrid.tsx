import { Plus, Search } from "lucide-react";
import type {
  AssessmentSessionState,
  AssessorEvaluationState,
  LevelMapping,
} from "../../types";
import { ActionCard } from "../dashboard/ActionCard";
import { AssessmentSessionCard } from "../dashboard/AssessmentSessionCard";

interface AssessmentGridProps {
  displayAssessments: AssessmentSessionState[];
  evaluations: AssessorEvaluationState[];
  currentLevelMappings: LevelMapping[];
  hasActiveFilters: boolean;
  handleClearFilters: () => void;
  handleOpenSessionModal: () => void;
}

export const AssessmentGrid = ({
  displayAssessments,
  evaluations,
  currentLevelMappings,
  hasActiveFilters,
  handleClearFilters,
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
          (e) => e.assessmentId === assessment.id
        );
        const completed = relatedEvals.filter(
          (e) => e.status === "completed"
        );
        const isCompleted =
          relatedEvals.length > 0 &&
          relatedEvals.every((e) => e.status === "completed");
        // Compute average score
        const totalScore = completed.reduce(
          (acc, curr) => acc + (curr.finalScore || 0),
          0
        );
        const avgScore =
          completed.length > 0
            ? totalScore / completed.length
            : undefined;

        // Construct a display object compatible with AssessmentSessionCard
        // We treat 'locked' as a pseudo-status or just use ongoing/completed
        const displaySession: AssessorEvaluationState = {
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
      {hasActiveFilters && displayAssessments.length === 0 && (
        <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
          <Search className="text-slate-300 w-12 h-12 mb-3" />
          <p className="text-slate-500 font-medium">
            No assessments match your filters
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-semibold underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
