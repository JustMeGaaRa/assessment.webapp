"use client";

import { notFound } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { AssessmentDetailsPage } from "@/views/AssessmentDetailsPage";
import {
  calculateAssessmentStatistics,
  calculateAssessorFeedbackScore,
} from "@lib/matrix";

export default function AssessmentDetailsPageRoute() {
  // TODO: use id from params to load from api
  const { assessments, profiles, matrix, levelMappings } = useAssessment();

  if (
    assessments.length <= 0 ||
    profiles.length <= 0 ||
    levelMappings.length <= 0 ||
    !matrix
  )
    return notFound();

  const assessmentSummary = calculateAssessmentStatistics(
    profiles[0],
    matrix,
    levelMappings,
    assessments[1],
  );
  const feedbacks = assessments[1].feedbacks.map((feedback) => ({
    ...feedback,
    stats: calculateAssessorFeedbackScore(
      profiles[0],
      feedback.assessor.fullname,
      feedback.modules,
    ),
  }));
  const status = assessments[1].feedbacks.every((f) => f.status === "completed")
    ? "completed"
    : "ongoing";

  return (
    <AssessmentDetailsPage
      status={status}
      assessment={assessmentSummary}
      feedbacks={feedbacks}
    />
  );
}
