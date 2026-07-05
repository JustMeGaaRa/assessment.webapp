"use client";

import { notFound } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { AssessmentDetailsPage } from "@/views/AssessmentDetailsPage";

export default function AssessmentDetailsPageRoute() {
  // TODO: use id from params to load from api
  const { assessments } = useAssessment();

  if (assessments.length <= 0) return notFound();

  return <AssessmentDetailsPage assessment={assessments[0]} />;
}
