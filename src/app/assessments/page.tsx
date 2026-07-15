import { AssessmentsPage } from "@/views/AssessmentsPage";
import {
  AssessmentSessionWithProgress,
  calculateAssessmentStatistics,
} from "@lib/matrix";
import {
  assessmentService,
  competenceMatrixService,
  jobProfileService,
  proficiencyLevelsService,
  skillLevelsService,
} from "@lib/services/azure/storage";

export default async function AssessmentsPageRoute() {
  const assessments = await assessmentService.getAssessments();
  const matrix = await competenceMatrixService.getCompetenceMatrix();
  const profiles = await jobProfileService.getJobProfiles();
  const proficiencyLevels =
    await proficiencyLevelsService.getProficiencyLevels();
  const skillLevels = await skillLevelsService.getSkillLevels();

  const allAssessments: Array<AssessmentSessionWithProgress> = assessments.map(
    (assessment) => {
      const profile = profiles.find(
        (profile) => profile.profileId === assessment.details.profile.profileId,
      )!;
      return {
        ...calculateAssessmentStatistics(
          profile,
          matrix,
          proficiencyLevels,
          skillLevels,
          assessment,
        ),
        // TODO: move this to state management
        progress: {
          totalFeedbacks: assessment.feedbacks.length,
          completedFeedbacks: assessment.feedbacks.filter(
            (f) => f.status === "completed",
          ).length,
          status: assessment.feedbacks.every((f) => f.status === "completed")
            ? "completed"
            : "ongoing",
        },
      };
    },
  );

  return <AssessmentsPage assessments={allAssessments} />;
}
