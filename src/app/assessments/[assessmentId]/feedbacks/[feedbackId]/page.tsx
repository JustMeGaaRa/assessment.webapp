"use client";

import { notFound } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { IndividualFeedbackPage } from "@/views/IndividualFeedbackPage";

export default function IndividualFeedbackPageRoute() {
  // TODO: use id from params to load from api
  const { assessments, profiles, matrix, levelMappings } = useAssessment();

  console.log("inside IndividualFeedbackPageRoute");

  if (
    assessments.length <= 0 ||
    profiles.length <= 0 ||
    levelMappings.length <= 0 ||
    !matrix
  )
    return notFound();

  const feedback = assessments[1].feedbacks[0];

  return (
    <IndividualFeedbackPage assessment={assessments[1]} feedback={feedback} />
  );
}
