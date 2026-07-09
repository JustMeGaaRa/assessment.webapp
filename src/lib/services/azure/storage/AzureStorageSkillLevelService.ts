import { SkillLevel } from "@lib/matrix";
import { SkillLevelService } from "@lib/services/intext";
import assessment_backup from "./assessment_backup_2026-07-05.json";

export class AzureStorageSkillLevelService implements SkillLevelService {
  async getSkillLevels(): Promise<SkillLevel[]> {
    return Promise.resolve(assessment_backup.skillLevels);
  }
}
