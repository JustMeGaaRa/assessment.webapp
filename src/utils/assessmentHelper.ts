import type { AssessorEvaluation, Module, Profile } from "../types";

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

export class AssessmentHelper {
  private session: AssessorEvaluation;
  private modules: Module[];
  private profile: Profile;

  constructor(
    session: AssessorEvaluation,
    modules: Module[],
    profile: Profile
  ) {
    this.session = session;
    this.modules = modules;
    this.profile = profile;
  }

  public calculate(): AssessmentSummaryResult {
    const moduleScores: Record<string, ModuleScore> = {};
    let grandTotalWeightedScore = 0;
    let globalCompletedCount = 0;
    let globalTotalTopics = 0;

    this.modules.forEach((module) => {
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
      const weight = this.profile.weights[module.id];

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

  /**
   * Calculates the overall aggregated score for an assessment based on multiple evaluations.
   * @param matrix The assessment matrix (modules)
   * @param profile The candidate's profile (weights)
   * @param moduleScores A record of ModuleID -> Array of scores (one per assessor)
   * @returns The overall weighted percentage (0-100)
   */
  public static calculateAggregateScore(
    matrix: Module[],
    profile: Profile,
    moduleScores: Record<string, number[]>
  ): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    matrix.forEach((mod) => {
      const weight = profile.weights[mod.id] || 0;
      const scores = moduleScores[mod.id] || [];

      if (scores.length > 0) {
        // Average score for this module across all assessors
        const avgModScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        // Add weighted contribution (Score/5 * Weight)
        totalWeightedScore += (avgModScore / 5) * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0
      ? Math.round((totalWeightedScore / totalWeight) * 100)
      : 0;
  }
}
