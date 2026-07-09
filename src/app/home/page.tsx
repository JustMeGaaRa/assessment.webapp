import { HomePage } from "@/views/HomePage";
import {
  AssessmentSessionWithProgress,
  calculateAssessmentStatistics,
} from "@lib/matrix";
import {
  assessmentService,
  competenceMatrixService,
  jobProfileService,
  proficiencyLevelsService,
} from "@lib/services/azure/storage";

export default async function HomePageRoute() {
  const assessments = await assessmentService.getAssessments();
  const matrix = await competenceMatrixService.getCompetenceMatrix();
  const profiles = await jobProfileService.getJobProfiles();
  const proficiencyLevels =
    await proficiencyLevelsService.getProficiencyLevels();

  const recenetAssessments: Array<AssessmentSessionWithProgress> = assessments
    .slice(0, 6)
    .map((assessment) => {
      const profile = profiles.find(
        (profile) => profile.profileId === assessment.details.profile.profileId,
      )!;
      return {
        ...calculateAssessmentStatistics(
          profile,
          matrix,
          proficiencyLevels,
          assessment,
        ),
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
    });

  // TODO: compute stats in the service
  const uniqueExperts = new Set(
    assessments.flatMap((assessment) =>
      assessment.feedbacks.map((feedback) => feedback.assessor.fullname),
    ),
  );
  const assessmentStats = {
    total: assessments.length,
    monthly: assessments.filter((assessment) => {
      const date = new Date(assessment.details.date);
      const now = new Date();
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length,
    experts: uniqueExperts.size,
  };

  return (
    <HomePage
      recentAssessments={recenetAssessments}
      assessmentStats={assessmentStats}
    />
  );
}
