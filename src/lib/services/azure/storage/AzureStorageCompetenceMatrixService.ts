import { CompetenceMatrixService } from "@lib/services/intext";
import { CompetenceMatrix } from "@lib/matrix";
import assessment_backup from "./assessment_backup_2026-07-05.json";

export class AzureStorageCompetenceMatrixService implements CompetenceMatrixService {
  async getCompetenceMatrix(): Promise<CompetenceMatrix> {
    return Promise.resolve({
      modules: assessment_backup.matrix.modules.map((m) => ({
        moduleId: m.moduleId,
        moduleName: m.moduleName,
        topics: m.topics.map((t) => ({
          topicId: t.topicId,
          topicName: t.topicName,
          type: t.type as "topic-definition",
          description: t.description,
        })),
      })),
      stacks: assessment_backup.matrix.stacks.map((s) => ({
        stackName: s.stackName,
        topics: s.topics.map((t) => ({
          topicId: t.topicId,
          topicName: t.topicName,
          type: t.type as "technology-topic",
          technologyDescription: t.technologyDescription,
        })),
      })),
    });
  }
}
