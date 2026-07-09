import { AzureStorageAssessmentService } from "./AzureStorageAssessmentService";
import { AzureStorageSkillLevelService } from "./AzureStorageSkillLevelService";
import { AzureStorageCompetenceMatrixService } from "./AzureStorageCompetenceMatrixService";
import { AzureStorageJobProfileService } from "./AzureStorageJobProfileService";
import { AzureStorageProficiencyLevelService } from "./AzureStorageProficiencyLevelService";

export * from "./AzureStorageAssessmentService";
export * from "./AzureStorageSkillLevelService";
export * from "./AzureStorageCompetenceMatrixService";
export * from "./AzureStorageJobProfileService";
export * from "./AzureStorageProficiencyLevelService";

export const assessmentService = new AzureStorageAssessmentService();
export const skillLevelsService = new AzureStorageSkillLevelService();
export const competenceMatrixService =
  new AzureStorageCompetenceMatrixService();
export const jobProfileService = new AzureStorageJobProfileService();
export const proficiencyLevelsService =
  new AzureStorageProficiencyLevelService();
