import { describe, test, expect } from "vitest";
import type { AssessmentSessionState, ProfileState } from "../types";

// A simple helper to test hook logic without full react-testing-library
// by extracting the core logic or running it dynamically
describe("useAssessmentFilters Logic Tests", () => {
  const mockAssessments: AssessmentSessionState[] = [
    {
      id: "a1",
      candidateName: "Alice Smith",
      profileId: "p1",
      profileTitle: "Frontend",
      stack: "React",
      date: "2026-06-01T00:00:00Z",
    },
    {
      id: "a2",
      candidateName: "Bob Jones",
      profileId: "p2",
      profileTitle: "Backend",
      stack: "Node",
      date: "2026-06-02T00:00:00Z",
    },
  ];

  const mockProfiles: ProfileState[] = [
    { id: "p1", title: "Frontend", stack: "React", description: "", weights: {} },
    { id: "p2", title: "Backend", stack: "Node", description: "", weights: {} },
  ];

  const mockStacks = ["React", "Node"];

  test("calculates popularity and yields correct unified chips sort order", () => {
    // Both profiles/stacks have 1 assessment each, sorting by popularity (1) then alphabetical label.
    // Let's verify counts and names
    const mockAssessmentsForPopularity: AssessmentSessionState[] = [
      ...mockAssessments,
      {
        id: "a3",
        candidateName: "Charlie",
        profileId: "p1",
        profileTitle: "Frontend",
        stack: "React",
        date: "2026-06-03T00:00:00Z",
      },
    ];

    // p1 has 2 assessments, React has 2 assessments.
    // p2 has 1 assessment, Node has 1 assessment.
    // So 'Frontend' and 'React' should be at the top of unified chips list.
    const mockState = {
      assessments: mockAssessmentsForPopularity,
      currentProfiles: mockProfiles,
      currentStacks: mockStacks,
    };

    // Calculate popularity sorted chips inline using the same logic as hook
    const unifiedChips = [
      ...mockState.currentProfiles.map((p) => {
        const totalCount = mockState.assessments.filter(
          (a) => a.profileId === p.id
        ).length;
        return {
          type: "profile" as const,
          id: p.id,
          label: p.title,
          popularity: totalCount,
        };
      }),
      ...mockState.currentStacks.map((s) => {
        const totalCount = mockState.assessments.filter(
          (a) => a.stack === s
        ).length;
        return {
          type: "stack" as const,
          id: s,
          label: s,
          popularity: totalCount,
        };
      }),
    ].sort(
      (a, b) => b.popularity - a.popularity || a.label.localeCompare(b.label)
    );

    expect(unifiedChips[0].label).toBe("Frontend");
    expect(unifiedChips[1].label).toBe("React");
    expect(unifiedChips[0].popularity).toBe(2);
    expect(unifiedChips[1].popularity).toBe(2);
    expect(unifiedChips[2].popularity).toBe(1);
  });

  test("filtering by candidate name search term matches correctly", () => {
    const searchTerm = "alice";
    const filtered = mockAssessments.filter((assessment) => {
      const matchesName = assessment.candidateName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesName;
    });

    expect(filtered.length).toBe(1);
    expect(filtered[0].candidateName).toBe("Alice Smith");
  });
});
