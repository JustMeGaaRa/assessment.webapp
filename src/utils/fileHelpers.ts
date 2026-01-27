import { saveAs } from "file-saver";
import Papa from "papaparse";
import type { AssessmentSession, Module } from "../types";

// --- JSON Helpers ---

export const exportSessionToJSON = (session: AssessmentSession) => {
  const blob = new Blob([JSON.stringify(session, null, 2)], {
    type: "application/json",
  });
  saveAs(
    blob,
    `assessment_${session.candidateName.replace(/\s+/g, "_").toLowerCase()}_${session.date}.json`,
  );
};

export const importSessionFromJSON = (
  file: File,
): Promise<AssessmentSession> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation
        if (!json.id || !json.candidateName || !json.scores) {
          throw new Error("Invalid assessment file format");
        }
        resolve(json as AssessmentSession);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// --- CSV Helpers (Full Assessment Level) ---

export const exportAssessmentToCSV = (
  session: AssessmentSession,
  matrix: Module[],
) => {
  // Flatten all topics from all modules
  const data = matrix.flatMap((module) =>
    module.topics.map((topic) => ({
      "Module ID": module.id,
      "Module Title": module.title,
      "Topic ID": topic.id,
      Topic: topic.name,
      "Stack Mapping": topic.mappings?.[session.stack] || "",
      Score: session.scores[topic.id] ?? "",
      Note: session.notes[topic.id] ?? "",
    })),
  );

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `assessment_scores_${session.candidateName.replace(/\s+/g, "_").toLowerCase()}_${session.date}.csv`);
};

export const parseAssessmentCSV = (
  file: File,
): Promise<{ scores: Record<string, number>; notes: Record<string, string> }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const scores: Record<string, number> = {};
          const notes: Record<string, string> = {};

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          results.data.forEach((row: any) => {
            const id = row["Topic ID"];
            if (id) {
              // Parse Score
              const scoreVal = parseInt(row["Score"]);
              if (!isNaN(scoreVal) && scoreVal >= 0 && scoreVal <= 5) {
                scores[id] = scoreVal;
              }
              // Parse Note (Optional, but good to restore if present)
              if (row["Note"]) {
                notes[id] = row["Note"];
              }
            }
          });
          resolve({ scores, notes });
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
};
