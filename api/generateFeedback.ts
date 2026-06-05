import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import { Liquid } from "liquidjs";
import { z } from "zod";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log("Request received at /api/generateFeedback");
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    assessmentDate,
    candidateName,
    profileName,
    technologyStack,
    summaryScore,
    proficiencyLevel,
    assessmentNotes,
  } = request.body;

  if (!process.env.GEMINI_API_KEY) {
    return response.status(500).json({ error: "GEMINI_API_KEY is not set" });
  }

  try {
    const templatePath = path.join(
      process.cwd(),
      "api",
      "assessment_summary_template.md",
    );

    const details = {
      assessmentDate,
      candidateName,
      profileName,
      technologyStack,
      summaryScore,
      proficiencyLevel,
      assessmentNotes,
    };

    const result = await generateFeedbackObject(details);

    const liquid = new Liquid();
    const templateContent = fs.readFileSync(templatePath, "utf8");
    const feedback = await liquid.parseAndRender(templateContent, result);

    return response.status(200).json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return response.status(500).json({ error: "Failed to generate feedback" });
  }
}

function getAssessmentSummarySchema() {
  const assessmentDetailsSchema = z.object({
    candidate_name: z.string().describe("Full name of the candidate"),
    assessment_date: z
      .string()
      .describe("Date of assessment in dd/mm/yyyy format"),
    assessment_quarter: z
      .string()
      .describe("Assessment quarter for which assessment was conducted"),
    target_profile_name: z
      .string()
      .describe("Target profile name for which assessment was conducted"),
    target_technology_stack: z
      .string()
      .describe("Target technology stack for which assessment was conducted"),
    summary: z.object({
      proficiency_level: z
        .string()
        .describe("Overall proficiency level of the candidate"),
      description: z
        .string()
        .describe(
          "Brief 2–3 sentence summary of overall performance and readiness.",
        ),
      key_strengths: z
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
      development_areas: z
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
      recommended_resources: z
        .array(
          z.object({
            resource: z.string().describe("Resource name"),
            description: z.string().describe("Description of the resource"),
          }),
        )
        .describe(
          "Recommended resources for the candidate based on assessment notes and overall summary.",
        ),
      development_actions: z
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

  return assessmentDetailsSchema;
}

export async function generateFeedbackObject(details: {
  assessmentDate: string;
  candidateName: string;
  profileName: string;
  technologyStack: string;
  summaryScore: number;
  proficiencyLevel: string;
  assessmentNotes: string;
}) {
  const prompt = `
    You are an AI assistant that specializes in generating professional assessment feedback for candidates. 
    Your task is to produce a structured and polished assessment summary based on the provided raw notes and assessment details.
    Refine the feedback notes to sound professional, objective, and constructive rather than subjective.

    <feedback_input_json>
    ${JSON.stringify(details)}
    </feedback_input_json>
    `;

  const assessmentDetailsSchema = getAssessmentSummarySchema();

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(assessmentDetailsSchema),
    },
  });

  return assessmentDetailsSchema.parse(JSON.parse(result.text || "{}"));
}
