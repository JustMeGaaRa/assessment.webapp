import { useState } from "react";
import type {
  AssessmentSession,
  Profile,
} from "../lib/matrix/types";

interface UseAssessmentFiltersProps {
  assessments: AssessmentSession[];
  currentProfiles: Profile[];
  currentStacks: string[];
  hostedSessionId?: string | null;
}

export const useAssessmentFilters = ({
  assessments,
  currentProfiles,
  currentStacks,
  hostedSessionId,
}: UseAssessmentFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedProfiles.length > 0 ||
    selectedStacks.length > 0 ||
    sortBy !== "date" ||
    sortOrder !== "desc";

  const toggleProfile = (profileId: string) => {
    setSelectedProfiles((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId],
    );
  };

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack],
    );
  };

  const getProfileCount = (profileId: string) => {
    return assessments
      .filter((a) => a.assessmentId !== hostedSessionId)
      .filter((a) => {
        const matchesName = a.details.candidate.fullname
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStack =
          selectedStacks.length === 0 || selectedStacks.includes(a.details.stack);
        return matchesName && matchesStack && a.details.profile.profileId === profileId;
      }).length;
  };

  const getStackCount = (stack: string) => {
    return assessments
      .filter((a) => a.assessmentId !== hostedSessionId)
      .filter((a) => {
        const matchesName = a.details.candidate.fullname
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesProfile =
          selectedProfiles.length === 0 ||
          selectedProfiles.includes(a.details.profile.profileId);
        return matchesName && matchesProfile && a.details.stack === stack;
      }).length;
  };

  const unifiedChips = [
    ...currentProfiles.map((p) => {
      const totalCount = assessments.filter(
        (a) => a.assessmentId !== hostedSessionId && a.details.profile.profileId === p.profileId,
      ).length;
      return {
        type: "profile" as const,
        id: p.profileId,
        label: p.profileName,
        popularity: totalCount,
      };
    }),
    ...currentStacks.map((s) => {
      const totalCount = assessments.filter(
        (a) => a.assessmentId !== hostedSessionId && a.details.stack === s,
      ).length;
      return {
        type: "stack" as const,
        id: s,
        label: s,
        popularity: totalCount,
      };
    }),
  ].sort(
    (a, b) => b.popularity - a.popularity || a.label.localeCompare(b.label),
  );

  const filteredAssessments = assessments
    .filter((a) => a.assessmentId !== hostedSessionId)
    .filter((assessment) => {
      const matchesName = assessment.details.candidate.fullname
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesProfile =
        selectedProfiles.length === 0 ||
        selectedProfiles.includes(assessment.details.profile.profileId);
      const matchesStack =
        selectedStacks.length === 0 ||
        selectedStacks.includes(assessment.details.stack);
      return matchesName && matchesProfile && matchesStack;
    });

  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.details.candidate.fullname.localeCompare(b.details.candidate.fullname);
    } else if (sortBy === "date") {
      comparison = a.details.date.getTime() - b.details.date.getTime();
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const displayAssessments = hasActiveFilters
    ? sortedAssessments
    : sortedAssessments.slice(0, 10);

  return {
    searchTerm,
    setSearchTerm,
    selectedProfiles,
    setSelectedProfiles,
    selectedStacks,
    setSelectedStacks,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleProfile,
    toggleStack,
    getProfileCount,
    getStackCount,
    unifiedChips,
    displayAssessments,
  };
};
