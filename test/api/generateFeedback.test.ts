import { describe, test, expect } from "vitest";
import dotenv from "dotenv";
import path from "path";
import { POST } from "../../src/app/api/generateFeedback/route";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

describe("generateFeedback API Integration Test", () => {
  test("should verify that the GEMINI_API_KEY env variable is loaded", () => {
    expect(process.env.GEMINI_API_KEY).toBeDefined();
    expect(process.env.GEMINI_API_KEY).not.toBe("");
  });

  test("should return 500 when GEMINI_API_KEY is not set", async () => {
    const originalApiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const req = new Request("http://localhost/api/generateFeedback", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toEqual({
      error: "GEMINI_API_KEY is not set",
    });

    process.env.GEMINI_API_KEY = originalApiKey;
  });

  test("should generate feedback successfully using the actual Gemini SDK", async () => {
    const body = {
      details: {
        candidate: "John Doe",
        profile: "Senior Frontend Engineer",
        stack: "React, TypeScript",
        date: "2026-06-19T00:00:00.000Z",
      },
      modules: [
        {
          moduleName: "Frontend Core",
          weightedScore: 4.5,
          weight: 100,
          notes: ["Strong candidate with good React knowledge."],
        },
      ],
      summary: {
        proficiencyLevel: "Senior",
        totalScore: 4.5,
      },
    };

    const req = new Request("http://localhost/api/generateFeedback", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("feedback");

    const feedback = data.feedback;

    // Validate that the feedback contains expected content generated from the template and model integration
    expect(feedback).toContain("John Doe");
    expect(feedback).toBeTruthy();
  }, 30000); // 30-second timeout for the real API integration
});
