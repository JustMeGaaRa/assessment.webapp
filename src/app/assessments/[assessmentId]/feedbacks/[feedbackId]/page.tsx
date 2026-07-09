import { notFound } from "next/navigation";
import { IndividualFeedbackPage } from "@/views/IndividualFeedbackPage";
import {
  assessmentService,
  skillLevelsService,
} from "@lib/services/azure/storage";

export default async function IndividualFeedbackPageRoute({
  params,
}: {
  params: Promise<{ assessmentId: string; feedbackId: string }>;
}) {
  const { assessmentId, feedbackId } = await params;
  const assessment = await assessmentService.getAssessmentById(assessmentId);
  const feedback = await assessmentService.getFeedbackById(
    assessmentId,
    feedbackId,
  );
  const skillLevels = await skillLevelsService.getSkillLevels();

  if (!assessment || !feedback) return notFound();

  return (
    <IndividualFeedbackPage
      assessment={assessment}
      feedback={feedback}
      skillLevels={skillLevels}
    />
  );
}
