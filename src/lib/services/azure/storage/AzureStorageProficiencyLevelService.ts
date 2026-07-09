import { ProficiencyLevelService } from "@lib/services/intext";
import assessment_backup from "./assessment_backup_2026-07-05.json";
import { ProficiencyLevel } from "@lib/matrix";

export class AzureStorageProficiencyLevelService implements ProficiencyLevelService {
  getProficiencyLevels(): Promise<ProficiencyLevel[]> {
    const proficiencyLevels = assessment_backup.proficiencyLevels.map(
      (proficiencyLevel) => ({
        level: proficiencyLevel.level,
        description: proficiencyLevel.description,
        scoreThreshold: proficiencyLevel.scoreThreshold,
        title: proficiencyLevel.title,
      }),
    );

    return Promise.resolve(proficiencyLevels);
  }
}
