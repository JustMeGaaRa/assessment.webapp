import { GeminiAssessmentScore } from "@agents/types";
import { evaluateAssessment } from "./agents/evaluate-assessment/agent";
import { summarizeTranscript } from "./agents/summarize-transcript/agent";
import { SkillLevel, TechnologyStack } from "./matrix/types";

export async function generateAssessmentSummary(
  transcript: string,
  technologyStack: TechnologyStack,
  skillScores: SkillLevel[],
): Promise<GeminiAssessmentScore> {
  const summary = await summarizeTranscript(transcript);
  return evaluateAssessment(technologyStack, skillScores, summary);
}
