import type { AssessmentSession, Module, Profile } from "../types";

export interface ModuleScore {
  moduleId: string;
  moduleTitle: string;
  totalTopics: number;
  completedTopics: number;
  rawSum: number;
  averageScore: number;
  weight: number;
  weightedScore: number;
}

export interface AssessmentSummaryResult {
  candidateName: string;
  profileTitle: string;
  stack: string;
  totalScore: number;
  moduleScores: Record<string, ModuleScore>;
  completedCount: number;
  totalTopics: number;
}

export class AssessmentSummary {
  private session: AssessmentSession;
  private matrix: Module[];
  private profile: Profile | undefined;

  constructor(
    session: AssessmentSession,
    matrix: Module[],
    profiles: Profile[]
  ) {
    this.session = session;
    this.matrix = matrix;
    this.profile = profiles.find((p) => p.id === session.profileId);
  }

  public calculate(): AssessmentSummaryResult {
    const moduleScores: Record<string, ModuleScore> = {};
    let grandTotalWeightedScore = 0;
    let globalCompletedCount = 0;
    let globalTotalTopics = 0;

    this.matrix.forEach((module) => {
      let moduleSum = 0;
      let moduleCompletedCount = 0;
      const moduleTotalTopics = module.topics.length;

      module.topics.forEach((topic) => {
        globalTotalTopics++;
        const score = this.session.scores[topic.id];
        if (score !== undefined) {
          moduleSum += score;
          moduleCompletedCount++;
          globalCompletedCount++;
        }
      });

      // "The module score is an average score for all topics with a score."
      // So if 3 topics are scored, divide by 3. If 0 scored, average is 0.
      const averageScore =
        moduleCompletedCount > 0 ? moduleSum / moduleCompletedCount : 0;

      // Get Weight
      const weight = this.profile?.weights?.[module.id] || 0;

      // Calculate Weighted Contribution
      const weightedScore = averageScore * weight / 100;

      // Accumulate Total Score
      grandTotalWeightedScore += weightedScore;

      moduleScores[module.id] = {
        moduleId: module.id,
        moduleTitle: module.title,
        totalTopics: moduleTotalTopics,
        completedTopics: moduleCompletedCount,
        rawSum: moduleSum,
        averageScore: averageScore,
        weight: weight,
        weightedScore: weightedScore,
      };
    });

    return {
      candidateName: this.session.candidateName,
      profileTitle: this.session.profileTitle,
      stack: this.session.stack,
      totalScore: Number(grandTotalWeightedScore.toFixed(1)),
      moduleScores,
      completedCount: globalCompletedCount,
      totalTopics: globalTotalTopics,
    };
  }
}
