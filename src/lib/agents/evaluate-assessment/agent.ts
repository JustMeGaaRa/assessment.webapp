import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import {
  IndividualAssessmentScore,
  DiscussionSummary,
  IndividualAssessmentScoreSchema,
} from "@agents/types";
import { CompetencyMatrix, SkillLevel } from "@lib/matrix/types";
import { systemPrompt } from "./prompt";

export async function evaluateAssessment(
  assessmentMatrix: CompetencyMatrix,
  skillScores: SkillLevel[],
  discussionSummary: DiscussionSummary,
): Promise<IndividualAssessmentScore> {
  const userPrompt = `
    <assessment_matrix_json>
    ${JSON.stringify(assessmentMatrix)}
    </assessment_matrix_json>
    <skill_scores_json>
    ${JSON.stringify(skillScores)}
    </skill_scores_json>
    <assessment_summary_json>
    ${JSON.stringify(discussionSummary)}
    </assessment_summary_json>
  `;

  const result = await generateText({
    model: google("gemini-3.5-flash"),
    system: systemPrompt,
    prompt: userPrompt,
    output: Output.object({
      schema: IndividualAssessmentScoreSchema,
    }),
  });

  return result.output;
}
