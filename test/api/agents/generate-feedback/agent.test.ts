import { describe, test, expect } from "vitest";
import { generateFeedback } from "../../../../src/lib/agents/generate-feedback";
import dotenv from "dotenv";
import path from "path";
import { ConsolidatedAssessmentSummary } from "../../../../src/lib/matrix/types";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

describe("generateFeedbackObject", () => {
  test("should successfully call Gemini SDK and return parsed schema object", async () => {
    const details: ConsolidatedAssessmentSummary = {
      assessmentId: "1",
      details: {
        date: new Date("05/06/2026"),
        candidate: {
          fullname: "John Doe",
        },
        profile: {
          profileId: "1",
          title: "Senior Frontend Engineer",
        },
        stack: "React, TypeScript",
      },
      modules: [
        {
          moduleName: "Frontend",
          weightedScore: 0.64,
          weight: 0.3,
          notes: [],
        },
      ],
      summary: {
        proficiencyLevel: "Senior",
        totalScore: 4.5,
      },
    };

    const result = await generateFeedback(details);

    // Verify returned object conforms to the expected structure and data
    expect(result).toHaveProperty("candidateName");
    expect(result.candidateName).toBe("John Doe");
    expect(result).toHaveProperty("assessmentDate");
    expect(result).toHaveProperty("assessmentQuarter");

    expect(result).toHaveProperty("targetProfileName");
    expect(result.targetProfileName).toBe("Senior Frontend Engineer");
    expect(result).toHaveProperty("targetTechnologyStack");
    expect(result.targetTechnologyStack).toBe("React, TypeScript");

    expect(result).toHaveProperty("summary");
    expect(result.summary).toHaveProperty("proficiencyLevel");
    expect(result.summary).toHaveProperty("description");
    expect(result.summary).toHaveProperty("keyStrengths");
    expect(Array.isArray(result.summary.keyStrengths)).toBe(true);
    expect(result.summary).toHaveProperty("developmentAreas");
    expect(Array.isArray(result.summary.developmentAreas)).toBe(true);
    expect(result.summary).toHaveProperty("recommendedResources");
    expect(Array.isArray(result.summary.recommendedResources)).toBe(true);
    expect(result.summary).toHaveProperty("developmentActions");
    expect(Array.isArray(result.summary.developmentActions)).toBe(true);
  }, 30000); // 30-second timeout for the real API integration
});
