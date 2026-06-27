import { NextResponse } from "next/server";
import { generateAssessmentSummary } from "@lib/evaluateAssessment";

export async function POST(request: Request) {
  console.log("Request received at /api/evaluateAssessment");

  try {
    const { transcript, matrix, skills } = await request.json();
    const summary = await generateAssessmentSummary(transcript, matrix, skills);

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error) {
    console.error("Error analyzing assessment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
