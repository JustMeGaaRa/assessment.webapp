import { describe, test, expect } from "vitest";
import { AssessmentHelper } from "../../src/utils/assessmentHelper";
import type { ProfileState, AssessorTopicScore } from "../../src/types";

describe("AssessmentHelper Unit Tests", () => {
  const mockProfile: ProfileState = {
    id: "fe-dev",
    title: "Frontend Engineer",
    stack: "React",
    description: "Frontend developer profile",
    weights: {
      "module-js": 60,
      "module-css": 40,
    },
  };

  test("calculateEvaluationStatistics calculates scores correctly based on weights", () => {
    const topics: Record<string, AssessorTopicScore> = {
      closures: { topicId: "closures", score: 4, notes: "Good" },
      async: { topicId: "async", score: 2, notes: "Needs improvement" },
    };

    const stats = AssessmentHelper.calculateEvaluationStatistics(
      mockProfile,
      "module-js",
      topics,
    );

    // averageScore = (4 + 2) / 2 = 3
    // weight = 60
    // weightedScore = (3 * 60) / 100 = 1.8
    expect(stats.averageScore).toBe(3);
    expect(stats.weightedScore).toBe(1.8);
    expect(stats.weight).toBe(60);
    expect(stats.notes).toEqual(["Good", "Needs improvement"]);
  });

  test("calculateEvaluationStatistics handles empty topics gracefully", () => {
    const stats = AssessmentHelper.calculateEvaluationStatistics(
      mockProfile,
      "module-js",
      {},
    );

    expect(stats.averageScore).toBe(0);
    expect(stats.weightedScore).toBe(0);
    expect(stats.notes).toEqual([]);
  });

  test("calculateEvaluationStatisticsPerAssessor aggregates stats across modules", () => {
    const evaluationId = "eval-1";
    const modulesData = {
      "module-js": {
        moduleId: "module-js",
        evaluationId,
        topics: {
          closures: { topicId: "closures", score: 4, notes: "Good" },
        },
      },
      "module-css": {
        moduleId: "module-css",
        evaluationId,
        topics: {
          flexbox: { topicId: "flexbox", score: 3, notes: "Average" },
        },
      },
    };

    const res = AssessmentHelper.calculateEvaluationStatisticsPerAssessor(
      mockProfile,
      evaluationId,
      modulesData,
    );

    // module-js average: 4, weighted: 4 * 0.6 = 2.4
    // module-css average: 3, weighted: 3 * 0.4 = 1.2
    // totalScore: 4 + 3 = 7
    // weightedScore: 2.4 + 1.2 = 3.6
    expect(res.totalScore).toBe(7);
    expect(res.weightedScore).toBeCloseTo(3.6, 5);
  });
});
