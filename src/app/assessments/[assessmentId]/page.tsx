import { notFound } from "next/navigation";
import { AssessmentDetailsPage } from "@/views/AssessmentDetailsPage";
import {
  AssessmentSessionWithProgress,
  calculateAssessmentStatistics,
  calculateAssessorFeedbackScore,
  IndividualAssessmentScoreWithProgress,
} from "@lib/matrix";
import {
  assessmentService,
  competenceMatrixService,
  jobProfileService,
  proficiencyLevelsService,
} from "@lib/services/azure/storage";

export default async function AssessmentDetailsPageRoute({
  params,
}: {
  params: Promise<{ assessmentId: string; feedbackId: string }>;
}) {
  const { assessmentId } = await params;
  const assessment = await assessmentService.getAssessmentById(assessmentId);
  const matrix = await competenceMatrixService.getCompetenceMatrix();
  const profile = await jobProfileService.getJobProfileById(
    assessment?.details.profile.profileId,
  );
  const proficiencyLevels =
    await proficiencyLevelsService.getProficiencyLevels();

  if (!assessment || !matrix || !profile || proficiencyLevels.length <= 0)
    return notFound();

  const assessmentStatistics: AssessmentSessionWithProgress = {
    ...calculateAssessmentStatistics(
      profile,
      matrix,
      proficiencyLevels,
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
  const feedbacks: Array<IndividualAssessmentScoreWithProgress> =
    assessment.feedbacks.map((feedback) => ({
      ...feedback,
      statistics: calculateAssessorFeedbackScore(
        profile,
        feedback.assessor.fullname,
        feedback.modules,
      ),
      progress: {
        totalTopics: feedback.modules.reduce(
          (total, module) => total + module.topics.length,
          0,
        ),
        completedTopics: feedback.modules.reduce(
          (scored, m) =>
            scored + m.topics.filter((t) => t.score !== undefined).length,
          0,
        ),
        status: "completed",
      },
    }));

  return (
    <AssessmentDetailsPage
      assessment={assessmentStatistics}
      feedbacks={feedbacks}
    />
  );
}
