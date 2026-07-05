"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { AssessmentsPage } from "@/views/AssessmentsPage";

export default function AssessmentsPageRoute() {
  // TODO: use id from params to load from api
  const { assessments } = useAssessment();

  return <AssessmentsPage assessments={assessments} />;
}
