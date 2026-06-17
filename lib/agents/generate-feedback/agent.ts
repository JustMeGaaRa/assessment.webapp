import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import {
  ConsolidatedAssessmentResult,
  ConsolidatedAssessmentResultSchema,
  ConsolidatedAssessmentSummary,
} from "../../types";
import { systemPrompt } from "./prompt";

export async function generateFeedback(
  summary: ConsolidatedAssessmentSummary,
): Promise<ConsolidatedAssessmentResult> {
  // TODO: consider adding a few words to the prompt explaining the input or system prompt is enough
  const userPrompt = JSON.stringify(summary);

  const result = await generateText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    prompt: userPrompt,
    output: Output.object({
      schema: ConsolidatedAssessmentResultSchema,
    }),
  });

  return result.output;
}
