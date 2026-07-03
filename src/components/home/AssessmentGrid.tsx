import { Plus } from "lucide-react";
import type {
  AssessmentSession,
  ProficiencyLevel,
  Profile,
} from "../../lib/matrix/types";
import { ActionCard } from "../dashboard/ActionCard";
import { AssessmentSessionCard } from "../dashboard/AssessmentSessionCard";

interface AssessmentGridProps {
  displayAssessments: AssessmentSession[];
  currentLevelMappings: ProficiencyLevel[];
  handleOpenSessionModal: () => void;
  profiles: Profile[];
}

export const AssessmentGrid = ({
  displayAssessments,
  currentLevelMappings,
  handleOpenSessionModal,
  profiles,
}: AssessmentGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ActionCard
        icon={<Plus size={24} />}
        title="New Assessment"
        description="Start a new evaluation session for a candidate"
        onClick={handleOpenSessionModal}
      />
      {displayAssessments.map((assessment) => (
        <AssessmentSessionCard
          key={assessment.assessmentId}
          assessment={assessment}
          levelMappings={currentLevelMappings}
          profiles={profiles}
        />
      ))}
    </div>
  );
};
