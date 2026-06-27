import { evaluateAssessment } from "./agents/evaluate-assessment/agent";
import { summarizeTranscript } from "./agents/summarize-transcript/agent";
import { CompetencyMatrix, SkillLevel } from "./matrix/types";
import type { IndividualAssessmentScore } from "@agents/types";

export async function generateAssessmentSummary(
  transcript: string,
  assessmentMatrix: CompetencyMatrix,
  skillScores: SkillLevel[],
): Promise<IndividualAssessmentScore> {
  const summary = await summarizeTranscript(transcript);
  return evaluateAssessment(assessmentMatrix, skillScores, summary);
}
