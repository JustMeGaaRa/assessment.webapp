import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import {
  DiscussionSummary,
  GeminiAssessmentScore,
  GeminiAssessmentScoreSchema,
} from "@agents/types";
import { SkillLevel, TechnologyStack } from "@lib/matrix/types";
import { systemPrompt } from "./prompt";

export async function evaluateAssessment(
  technologyStack: TechnologyStack,
  skillScores: SkillLevel[],
  discussionSummary: DiscussionSummary,
): Promise<GeminiAssessmentScore> {
  const userPrompt = `
    <technology_stack_json>
    ${JSON.stringify(technologyStack)}
    </technology_stack_json>
    <skill_scores_json>
    ${JSON.stringify(skillScores)}
    </skill_scores_json>
    <discussion_summary_json>
    ${JSON.stringify(discussionSummary)}
    </discussion_summary_json>
  `;

  const result = await generateText({
    model: google("gemini-3.5-flash"),
    system: systemPrompt,
    prompt: userPrompt,
    output: Output.object({
      schema: GeminiAssessmentScoreSchema,
    }),
  });

  return result.output;
}
