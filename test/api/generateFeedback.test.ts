import type { VercelRequest, VercelResponse } from "@vercel/node";
import { vi, describe, test, expect, beforeEach, type Mock } from "vitest";
import dotenv from "dotenv";
import path from "path";
import handler from "../../api/generateFeedback";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

describe("generateFeedback API Integration Test", () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: Mock;
  let statusMock: Mock;

  beforeEach(() => {
    jsonMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
    } as unknown as Partial<VercelResponse>;
  });

  test("should verify that the GEMINI_API_KEY env variable is loaded", () => {
    // Assert that the environment variable is loaded (either from .env.local or standard environment)
    expect(process.env.GEMINI_API_KEY).toBeDefined();
    expect(process.env.GEMINI_API_KEY).not.toBe("");
  });

  test("should return 405 Method Not Allowed for non-POST requests", async () => {
    req = {
      method: "GET",
    };

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(405);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Method Not Allowed" });
  });

  test("should return 500 when GEMINI_API_KEY is not set", async () => {
    const originalApiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    req = {
      method: "POST",
      body: {},
    };

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "GEMINI_API_KEY is not set",
    });

    process.env.GEMINI_API_KEY = originalApiKey;
  });

  test("should generate feedback successfully using the actual Gemini SDK", async () => {
    req = {
      method: "POST",
      body: {
        assessmentDate: "05/06/2026",
        candidateName: "John Doe",
        profileName: "Senior Frontend Engineer",
        technologyStack: "React, TypeScript",
        summaryScore: 4.5,
        proficiencyLevel: "Senior",
        assessmentNotes:
          "Strong candidate with good React knowledge. Needs to improve testing practices.",
      },
    };

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalled();

    const responseData = jsonMock.mock.calls[0][0];
    expect(responseData).toHaveProperty("feedback");

    const feedback = responseData.feedback;

    // Validate that the feedback contains expected content generated from the template and model integration
    expect(feedback).toContain("Dear John Doe");
    expect(feedback).toContain("05/06/2026");

    // Check that some AI-generated assessment summary content exists
    expect(feedback).toBeTruthy();
  }, 30000); // 30-second timeout for the real API integration
});
