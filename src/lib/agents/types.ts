import { z } from "zod";

export const DiscussionSummarySchema = z.object({
  topics: z.array(
    z.object({
      summary: z.string(),
      fullyAnswered: z.array(z.string()),
      partiallyAnswered: z.array(z.string()),
      notAnswered: z.array(z.string()),
    }),
  ),
});

export type DiscussionSummary = z.infer<typeof DiscussionSummarySchema>;

export const IndividualAssessmentScoreSchema = z.object({
  topics: z.array(
    z.object({
      name: z
        .string()
        .describe("The topic name is taken from assessment matrix"),
      score: z
        .number()
        .min(1, "Score cannot be less than 1")
        .max(5, "Score cannot be greater than 5")
        .describe(
          "The score of the candidate in this topic. It is calculated based on the assessment matrix and skill scores",
        ),
      reasoning: z
        .string()
        .describe(
          "The reasoning behind the score of the candidate in this topic. It is calculated based on the assessment matrix and skill scores",
        ),
      notes: z.string().describe("The notes from the candidate in this topic."),
    }),
  ),
});

export type IndividualAssessmentScore = z.infer<
  typeof IndividualAssessmentScoreSchema
>;

export const ConsolidatedAssessmentResultSchema = z.object({
  candidateName: z.string().describe("Full name of the candidate"),
  assessmentDate: z
    .string()
    .describe("Date of assessment in dd/mm/yyyy format"),
  assessmentQuarter: z
    .string()
    .describe("Assessment quarter for which assessment was conducted"),
  targetProfileName: z
    .string()
    .describe("Target profile name for which assessment was conducted"),
  targetTechnologyStack: z
    .string()
    .describe("Target technology stack for which assessment was conducted"),
  summary: z.object({
    proficiencyLevel: z
      .string()
      .describe("Overall proficiency level of the candidate"),
    description: z
      .string()
      .describe(
        "Brief 2–3 sentence summary of overall performance and readiness.",
      ),
    keyStrengths: z
      .array(
        z.object({
          competency: z.string().describe("Competency name"),
          description: z
            .string()
            .describe(
              "Short description of demonstrated capability and supporting evidence",
            ),
        }),
      )
      .describe("Key strengths of the candidate based on assessment notes."),
    developmentAreas: z
      .array(
        z.object({
          competency: z.string().describe("Competency name"),
          description: z
            .string()
            .describe("Specific gap relative to next proficiency level"),
        }),
      )
      .describe(
        "Development areas of the candidate based on assessment notes.",
      ),
    recommendedResources: z
      .array(
        z.object({
          resource: z.string().describe("Resource name"),
          description: z.string().describe("Description of the resource"),
        }),
      )
      .describe(
        "Recommended resources for the candidate based on assessment notes and overall summary.",
      ),
    developmentActions: z
      .array(
        z.object({
          action: z.string().describe("Action name"),
          description: z.string().describe("Description of the action"),
        }),
      )
      .describe(
        "Development actions for the candidate based on assessment notes and overall summary.",
      ),
  }),
});

export type ConsolidatedAssessmentResult = z.infer<
  typeof ConsolidatedAssessmentResultSchema
>;
