import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

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

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: {
        role: "user",
        parts: [
          {
            text: `
              Strictly follow the template provided to generate feedback for candidates after assessment.
              Each message provided by me will contain details and notes from the assessment that you have to fill into the template.
              Feel free to refine the feedback notes to sound professional and factual or objective rather than subjective.
            `,
          },
          { text: JSON.stringify(details) },
          {
            inlineData: {
              mimeType: "text/markdown",
              data: Buffer.from(fs.readFileSync(templatePath, "utf8")).toString(
                "base64",
              ),
            },
          },
        ],
      },
    });

    return response.status(200).json({ feedback: result.text });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return response.status(500).json({ error: "Failed to generate feedback" });
  }
}
