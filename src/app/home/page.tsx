"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { HomePage } from "@/views/HomePage";

export default function HomePageRoute() {
  const { assessments } = useAssessment();

  const recenetAssessments = assessments.slice(0, 6);

  // TODO: compute stats in the service
  const uniqueExperts = new Set(
    assessments.flatMap((assessment) =>
      assessment.feedbacks.map((feedback) => feedback.assessor.fullname),
    ),
  );
  const stats = {
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
    <HomePage recentAssessments={recenetAssessments} assessmentStats={stats} />
  );
}
