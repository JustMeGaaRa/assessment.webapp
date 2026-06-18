import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import { Liquid } from "liquidjs";
import { generateFeedback } from "./agents/generate-feedback/agent";
import type { ConsolidatedAssessmentSummary } from "../lib/types";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log("Request received at /api/generateFeedback");
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" });
  }

  const summary = request.body as ConsolidatedAssessmentSummary;

  if (!process.env.GEMINI_API_KEY) {
    return response.status(500).json({ error: "GEMINI_API_KEY is not set" });
  }

  try {
    const result = await generateFeedback(summary);

    const liquid = new Liquid();
    const templatePath = path.join(
      process.cwd(),
      "api",
      "assessment_summary_template.md",
    );
    const templateContent = fs.readFileSync(templatePath, "utf8");
    const feedback = await liquid.parseAndRender(templateContent, result);

    return response.status(200).json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return response.status(500).json({ error: "Failed to generate feedback" });
  }
}
