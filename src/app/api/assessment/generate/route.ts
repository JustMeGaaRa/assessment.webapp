import { NextResponse } from "next/server";
import { generateAssessmentSummary } from "@lib/evaluateAssessment";
import { SkillLevel, TechnologyStack } from "@lib/matrix";

export async function POST(request: Request) {
  console.log("Request received at /api/evaluateAssessment");

  try {
    const { transcript, technologyStack, skills } =
      (await request.json()) satisfies {
        transcript: string;
        technologyStack: TechnologyStack;
        skills: SkillLevel[];
      };
    const summary = await generateAssessmentSummary(
      transcript,
      technologyStack,
      skills,
    );

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error) {
    console.error("Error analyzing assessment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
