import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { systemPrompt } from "./prompt";
import { DiscussionSummarySchema, DiscussionSummary } from "../types";

export async function summarizeTranscript(
  transcript: string,
): Promise<DiscussionSummary> {
  // TODO: consider adding a few words to the prompt explaining the input or system prompt is enough
  const userPrompt = transcript;

  const result = await generateText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    prompt: userPrompt,
    output: Output.object({
      schema: DiscussionSummarySchema,
    }),
  });

  return result.output;
}
