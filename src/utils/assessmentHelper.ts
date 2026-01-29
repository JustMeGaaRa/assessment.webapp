import type { AssessorEvaluation, Module, Profile } from "../types";

export interface ModuleSummary {
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
  moduleScores: Record<string, ModuleSummary>;
  completedCount: number;
  totalTopics: number;
}

// evaluated types
export interface AssessorTopicScores {
  topicId: string;
  score: number;
  notes: string[];
}

export interface AssessorModuleScores {
  moduleId: string;
  topics: Record<string, AssessorTopicScores>;
}

export interface AssessorScore {
  evaluationId: string;
  modules: Record<string, AssessorModuleScores>
}

export interface AssessmentFeedback {
  assessmentId: string;
  evaluations: Record<string, AssessorScore>;
}

// calculated scores
export interface AssessorSummaryBreakdown {
  evaluationId: string;
  moduleId: string;
  topics: Record<string, AssessorTopicScores>
}

export interface ModuleSummaryBreakdown {
  moduleId: string;
  evaluations: Record<string, AssessorSummaryBreakdown>
}

export interface AssessmentSummaryBreakdown {
  assessmentId: string;
  modules: Record<string, ModuleSummaryBreakdown>
}

// calculated results
export interface ModuleStatistics {
  moduleId: string;
  averageScore: number;
  weightedScore: number;
  weight: number;
  notes: string[];
}

export interface AggregatedAssessorStatistics {
  moduleId: string;
  averageScore: number;
  weightedScore: number;
  weight: number;
  evaluationScores: Record<string, ModuleStatistics>;
  notes: string[];
}

export interface AssessmentStatistics {
  assessmentId: string;
  totalScore: number;
  moduleScores: Record<string, AggregatedAssessorStatistics>;
}

// helper class
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
    const moduleScores: Record<string, ModuleSummary> = {};
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

  public static calculateAverageModuleScorePerAssessor(
    profile: Profile,
    moduleId: string,
    // a list of topic scores for a single module from a single assessor
    // { topicId, AssessorTopicScores }
    topics: Record<string, AssessorTopicScores>
  ): ModuleStatistics {
    const totalScore = Object.values(topics).reduce((total, topic) => total + (topic.score ?? 0), 0);
    const scoredTopics = Object.values(topics).length;
    const averageScore = scoredTopics > 0 ? totalScore / scoredTopics : 0;
    const weight = profile.weights[moduleId] || 0;
    const weightedScore = averageScore * weight / 100;
    const notes = Object.values(topics).flatMap(topic => topic.notes);

    return {
      moduleId,
      averageScore,
      weightedScore,
      weight,
      notes
    };
  }

  public static calculateAverageModuleScoreAcrossAssessors(
    profile: Profile,
    moduleId: string,
    // a list of module scores for a single module from each assessor
    // { evaluationId, AssessorSummaryBreakdown }
    evaluations: Record<string, AssessorSummaryBreakdown>
  ): AggregatedAssessorStatistics {
    const moduleEvaluationScores = Object.values(evaluations).reduce((acc, evaluation) => ({
      ...acc,
      [evaluation.evaluationId]: {
        evaluationId: evaluation.evaluationId,
        ...this.calculateAverageModuleScorePerAssessor(profile, moduleId, evaluation.topics),
      }
    }), {} as Record<string, ModuleStatistics>);

    const moduleScores = Object.values(moduleEvaluationScores);

    return {
      moduleId,
      averageScore: moduleScores.reduce((total, evaluation) => total + evaluation.averageScore, 0) / moduleScores.length,
      weightedScore: moduleScores.reduce((total, evaluation) => total + evaluation.weightedScore, 0) / moduleScores.length,
      weight: moduleScores[0].weight,
      evaluationScores: moduleEvaluationScores,
      notes: moduleScores.flatMap(evaluation => evaluation.notes),
    }
  }

  public static calculateAssessmentScoreAcrossAssessors(
    profile: Profile,
    modules: Module[],
    assessment: AssessmentSummaryBreakdown
  ): AssessmentStatistics {
    const profileModules = modules.filter((mod) => profile.weights[mod.id] > 0);

    const moduleScores = profileModules.reduce((acc, module) => ({
      ...acc,
      [module.id]: this.calculateAverageModuleScoreAcrossAssessors(profile, module.id, assessment.modules[module.id].evaluations),
    }), {} as Record<string, AggregatedAssessorStatistics>);

    const totalScore = Object.values(moduleScores).reduce((total, moduleScore) => total + moduleScore.weightedScore, 0);
    
    return {
      assessmentId: assessment.assessmentId,
      totalScore,
      moduleScores
    }
  }

  public static changeAssessmentStructure(
    modules: Module[],
    profile: Profile,
    assessment: AssessmentFeedback
  ): AssessmentSummaryBreakdown {
    const profileModules = modules.filter((mod) => profile.weights[mod.id] > 0);
    
    return {
      assessmentId: assessment.assessmentId,
      modules: profileModules.reduce((mm, module) => ({
        ...mm,
        [module.id]: {
          moduleId: module.id,
          evaluations: Object.values(assessment.evaluations).reduce((ee, evaluation) => ({
            ...ee,
            [evaluation.evaluationId]: {
                moduleId: module.id,
                evaluationId: evaluation.evaluationId,
                topics: evaluation.modules[module.id].topics,
                notes: Object.values(evaluation.modules[module.id].topics).flatMap(topic => topic.notes),
            }
          }), {} as Record<string, AssessorSummaryBreakdown>)
        }
      }), {} as Record<string, ModuleSummaryBreakdown>)
    } as AssessmentSummaryBreakdown;
  }
}
