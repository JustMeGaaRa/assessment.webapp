import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Liquid } from "liquidjs";
import { generateFeedback } from "@agents/generate-feedback/agent";
import type { ConsolidatedAssessmentSummary } from "@lib/matrix/types";

export async function POST(request: Request) {
  console.log("Request received at /api/generateFeedback");

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set" },
      { status: 500 },
    );
  }

  try {
    const summary = (await request.json()) as ConsolidatedAssessmentSummary;
    const result = await generateFeedback(summary);

    const liquid = new Liquid();
    const templatePath = path.join(
      process.cwd(),
      "src",
      "lib",
      "templates",
      "assessment_summary_template.md",
    );
    const templateContent = fs.readFileSync(templatePath, "utf8");
    const feedback = await liquid.parseAndRender(templateContent, result);

    return NextResponse.json({ feedback }, { status: 200 });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 },
    );
  }
}
