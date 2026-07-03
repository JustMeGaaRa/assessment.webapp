import type {
  AppDataStateV1,
} from "../lib/state/v1/types";
import {
  AssessmentSession,
  CompetenceMatrix,
  ProficiencyLevel,
  Profile,
  SkillLevel,
  IndividualAssessmentScore,
} from "@lib/matrix/types";
import { getApplicationState } from "../lib/state/v2/mappers";

export const BACKUP_VERSION = 2;

export interface BackupDataV2 {
  version: 2;
  timestamp: string;
  matrix: CompetenceMatrix;
  proficiencyLevels: ProficiencyLevel[];
  profiles: Profile[];
  skillLevels: SkillLevel[];
  assessments: AssessmentSession[];
  assessorName: string;
}

export type BackupData = BackupDataV2;

export const createBackup = (
  matrix: CompetenceMatrix,
  proficiencyLevels: ProficiencyLevel[],
  profiles: Profile[],
  skillLevels: SkillLevel[],
  assessments: AssessmentSession[],
  assessorName: string,
): BackupData => {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    matrix,
    proficiencyLevels,
    profiles,
    skillLevels,
    assessments,
    assessorName,
  };
};

export const parseBackup = (jsonContent: string): BackupData => {
  try {
    const data = JSON.parse(jsonContent);

    // Basic structure validation
    if (!data.version) {
      throw new Error("Invalid backup format: Missing version");
    }

    // Version migration logic
    if (data.version === 1) {
      if (
        !data.library ||
        !data.assessments ||
        !data.evaluations
      ) {
        throw new Error("Invalid backup format: Missing required v1 fields");
      }
      const appStateV1: AppDataStateV1 = {
        version: 1,
        timestamp: new Date(data.timestamp),
        library: data.library,
        assessments: data.assessments,
        evaluations: data.evaluations,
      };
      const appStateV2 = getApplicationState(appStateV1);
      return {
        version: 2,
        timestamp: data.timestamp,
        matrix: appStateV2.matrix,
        proficiencyLevels: appStateV2.proficiencyLevels,
        profiles: appStateV2.profiles,
        skillLevels: appStateV2.skillLevels,
        assessments: appStateV2.assessments,
        assessorName: data.assessorName || "",
      };
    }

    if (data.version === 2) {
      const assessments: AssessmentSession[] = (data.assessments || []).map((a: AssessmentSession) => ({
        ...a,
        details: {
          ...a.details,
          date: new Date(a.details.date),
        },
        feedbacks: (a.feedbacks || []).map((f: IndividualAssessmentScore) => ({
          ...f,
          date: f.date ? new Date(f.date) : undefined,
        })),
      }));

      return {
        version: 2,
        timestamp: data.timestamp,
        matrix: data.matrix,
        proficiencyLevels: data.proficiencyLevels || [],
        profiles: data.profiles || [],
        skillLevels: data.skillLevels || [],
        assessments,
        assessorName: data.assessorName || "",
      };
    }

    throw new Error(`Unsupported backup version: ${data.version}`);
  } catch (error) {
    console.error("Backup parsing error:", error);
    throw new Error("Failed to parse backup file");
  }
};
