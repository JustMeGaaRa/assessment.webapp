"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { HomePage } from "@/views/HomePage";

export default function HomePageRoute() {
  const { assessments } = useAssessment();

  return <HomePage assessments={assessments} />;
}
