import type {
  AppDataState,
  AssessmentSessionState,
  AssessorEvaluationState,
} from "../types";

export const BACKUP_VERSION = 1;

export interface BackupDataV1 {
  version: 1;
  timestamp: string;
  library: AppDataState;
  assessments: AssessmentSessionState[];
  evaluations: AssessorEvaluationState[];
  assessorName: string;
}

export type BackupData = BackupDataV1;

export const createBackup = (
  library: AppDataState,
  assessments: AssessmentSessionState[],
  evaluations: AssessorEvaluationState[],
  assessorName: string
): BackupData => {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    library,
    assessments,
    evaluations,
    assessorName,
  };
};

export const parseBackup = (jsonContent: string): BackupData => {
  try {
    const data = JSON.parse(jsonContent);

    // Basic structure validation
    if (!data.version || !data.library || !data.assessments || !data.evaluations) {
      throw new Error("Invalid backup format: Missing required fields");
    }

    // Version migration logic
    if (data.version < BACKUP_VERSION) {
       // Placeholder for future migrations
       // return migrateBackup(data);
       // For now, since we are at v1, just return the data if it matches 'any' structure close enough,
       // or throw if it's too old (less likely since we just started).
    }
    
    // In the future, if we have v2, we would do:
    // if (data.version === 1) {
    //   data = migrateV1ToV2(data);
    // }

    return data as BackupData;
  } catch (error) {
    console.error("Backup parsing error:", error);
    throw new Error("Failed to parse backup file");
  }
};
