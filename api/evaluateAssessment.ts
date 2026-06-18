import { VercelRequest, VercelResponse } from "@vercel/node";
import { evaluateAssessment } from "@agents/evaluate-assessment/agent";
import { summarizeTranscript } from "@agents/summarize-transcript/agent";
import {
  IndividualAssessmentScore,
  CompetencyMatrix,
  SkillLevel,
} from "@lib/types";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log("Request received at /api/analyzeAssessment");

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { transcript, matrix, skills } = request.body as {
      transcript: string;
      matrix: CompetencyMatrix;
      skills: SkillLevel[];
    };
    const summary = await generateAssessmentSummary(transcript, matrix, skills);

    return response.status(200).json({ summary });
  } catch (error) {
    console.error("Error analyzing assessment:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}

export async function generateAssessmentSummary(
  transcript: string,
  assessmentMatrix: CompetencyMatrix,
  skillScores: SkillLevel[],
): Promise<IndividualAssessmentScore> {
  const summary = await summarizeTranscript(transcript);
  return evaluateAssessment(assessmentMatrix, skillScores, summary);
}
