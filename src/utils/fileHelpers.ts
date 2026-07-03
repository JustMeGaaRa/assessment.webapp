/* eslint-disable @typescript-eslint/no-explicit-any */
import { saveAs } from "file-saver";
import Papa from "papaparse";

// --- JSON Helpers ---

export const exportSessionToJSON = (session: any, candidateName: string = "session") => {
  const blob = new Blob([JSON.stringify(session, null, 2)], {
    type: "application/json",
  });
  saveAs(
    blob,
    `assessment_${candidateName.replace(/\s+/g, "_").toLowerCase()}_${session.date || new Date().toISOString()}.json`,
  );
};

export const importSessionFromJSON = (
  file: File,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.id && !json.feedbackId) {
          throw new Error("Invalid assessment file format");
        }
        resolve(json);
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
  session: any,
  matrix: any[],
) => {
  const data = matrix.flatMap((module) =>
    module.topics.map((topic: any) => ({
      "Module ID": module.id || module.moduleId,
      "Module Title": module.title || module.moduleName,
      "Topic ID": topic.id || topic.topicId,
      Topic: topic.name || topic.topicName,
      "Stack Mapping": topic.mappings?.[session.stack] || topic.technologyDescription || "",
      Score: (session.scores ? session.scores[topic.id || topic.topicId] : undefined) ?? "",
      Note: (session.notes ? session.notes[topic.id || topic.topicId] : undefined) ?? "",
    })),
  );

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(
    blob,
    `assessment_scores_${(session.candidateName || "session").replace(/\s+/g, "_").toLowerCase()}_${session.date}.csv`,
  );
};

export const parseAssessmentCSV = (
  file: File,
): Promise<{
  scores: Record<string, number>;
  notes: Record<string, string>;
}> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const scores: Record<string, number> = {};
          const notes: Record<string, string> = {};

          results.data.forEach((row: any) => {
            const id = row["Topic ID"];
            if (id) {
              const scoreVal = parseInt(row["Score"]);
              if (!isNaN(scoreVal) && scoreVal >= 0 && scoreVal <= 5) {
                scores[id] = scoreVal;
              }
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
