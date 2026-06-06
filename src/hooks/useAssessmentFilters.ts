import { useState } from "react";
import type { AssessmentSessionState, ProfileState } from "../types";

interface UseAssessmentFiltersProps {
  assessments: AssessmentSessionState[];
  currentProfiles: ProfileState[];
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
      .filter((a) => a.id !== hostedSessionId)
      .filter((a) => {
        const matchesName = a.candidateName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStack =
          selectedStacks.length === 0 || selectedStacks.includes(a.stack);
        return matchesName && matchesStack && a.profileId === profileId;
      }).length;
  };

  const getStackCount = (stack: string) => {
    return assessments
      .filter((a) => a.id !== hostedSessionId)
      .filter((a) => {
        const matchesName = a.candidateName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesProfile =
          selectedProfiles.length === 0 ||
          selectedProfiles.includes(a.profileId);
        return matchesName && matchesProfile && a.stack === stack;
      }).length;
  };

  const unifiedChips = [
    ...currentProfiles.map((p) => {
      const totalCount = assessments.filter(
        (a) => a.id !== hostedSessionId && a.profileId === p.id,
      ).length;
      return {
        type: "profile" as const,
        id: p.id,
        label: p.title,
        popularity: totalCount,
      };
    }),
    ...currentStacks.map((s) => {
      const totalCount = assessments.filter(
        (a) => a.id !== hostedSessionId && a.stack === s,
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
    .filter((a) => a.id !== hostedSessionId)
    .filter((assessment) => {
      const matchesName = assessment.candidateName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesProfile =
        selectedProfiles.length === 0 ||
        selectedProfiles.includes(assessment.profileId);
      const matchesStack =
        selectedStacks.length === 0 ||
        selectedStacks.includes(assessment.stack);
      return matchesName && matchesProfile && matchesStack;
    });

  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.candidateName.localeCompare(b.candidateName);
    } else if (sortBy === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
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
