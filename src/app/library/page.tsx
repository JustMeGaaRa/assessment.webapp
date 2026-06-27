"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { AssessmentLibraryPage } from "@/views/AssessmentLibrary";

export default function LibraryRoute() {
  const { matrix, profiles, stacks, levelMappings } = useAssessment();

  return (
    <AssessmentLibraryPage
      matrix={matrix}
      profiles={profiles}
      stacks={stacks}
      levelMappings={levelMappings}
    />
  );
}
