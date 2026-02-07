import type {
  AggregatedAssessorStatistics,
  AssessmentScores,
  AssessmentStatistics,
  AssessmentSummaryBreakdown,
  AssessorEvaluationModuleStatistics,
  AssessorModuleScores,
  AssessorTopicScore,
  ModuleState,
  ModuleSummaryBreakdown,
  ProfileState,
} from "../types";

// helper class
export class AssessmentHelper {
  public static calculateEvaluationStatistics(
    profile: ProfileState,
    moduleId: string,
    // a list of topic scores for a single module from a single assessor
    // { topicId, AssessorTopicScores }
    topics: Record<string, AssessorTopicScore>,
  ): AssessorEvaluationModuleStatistics {
    const totalScore = Object.values(topics).reduce(
      (total, topic) => total + (topic.score ?? 0),
      0,
    );
    const scoredTopics = Object.values(topics).length;
    const averageScore = scoredTopics > 0 ? totalScore / scoredTopics : 0;
    const weight = profile.weights[moduleId] || 0;
    const weightedScore = (averageScore * weight) / 100;
    const notes = Object.values(topics)
      .flatMap((topic) => topic.notes)
      .filter((note) => note !== undefined && note !== "");

    return {
      moduleId,
      averageScore,
      weightedScore,
      weight,
      notes,
    };
  }

  public static calculateEvaluationStatisticsPerAssessor(
    profile: ProfileState,
    evaluationId: string,
    modules: Record<string, AssessorModuleScores>,
  ) {
    const moduleScores = Object.values(modules).reduce(
      (acc, module) => ({
        ...acc,
        [module.moduleId]: this.calculateEvaluationStatistics(
          profile,
          module.moduleId,
          module.topics,
        ),
      }),
      {} as Record<string, AssessorEvaluationModuleStatistics>,
    );

    const moduleScoresList = Object.values(moduleScores);

    return {
      evaluationId: evaluationId,
      totalScore: moduleScoresList.reduce(
        (total, evaluation) => total + evaluation.averageScore,
        0,
      ),
      weightedScore: moduleScoresList.reduce(
        (total, evaluation) => total + evaluation.weightedScore,
        0,
      ),
      weight: moduleScoresList[0].weight,
      moduleScores: moduleScores,
    };
  }

  public static calculateAggregatedEvaluationsStatistics(
    profile: ProfileState,
    moduleId: string,
    // a list of module scores for a single module from each assessor
    // { evaluationId, AssessorSummaryBreakdown }
    evaluations: Record<string, AssessorModuleScores>,
  ): AggregatedAssessorStatistics {
    const assessorEvaluationStatistics = Object.values(evaluations).reduce(
      (acc, evaluation) => ({
        ...acc,
        [evaluation.evaluationId]: {
          evaluationId: evaluation.evaluationId,
          ...this.calculateEvaluationStatistics(
            profile,
            moduleId,
            evaluation.topics,
          ),
        },
      }),
      {} as Record<string, AssessorEvaluationModuleStatistics>,
    );

    const moduleStatistics = Object.values(assessorEvaluationStatistics);

    return {
      moduleId,
      averageScore:
        moduleStatistics.reduce(
          (total, evaluation) => total + evaluation.averageScore,
          0,
        ) / moduleStatistics.length,
      weightedScore:
        moduleStatistics.reduce(
          (total, evaluation) => total + evaluation.weightedScore,
          0,
        ) / moduleStatistics.length,
      weight: moduleStatistics[0].weight,
      assessorEvaluationStatistics,
    };
  }

  public static calculateAssessmentStatistics(
    profile: ProfileState,
    modules: ModuleState[],
    assessment: AssessmentSummaryBreakdown,
  ): AssessmentStatistics {
    const profileModules = modules.filter((mod) => profile.weights[mod.id] > 0);

    const moduleScores = profileModules.reduce(
      (acc, module) => ({
        ...acc,
        [module.id]: this.calculateAggregatedEvaluationsStatistics(
          profile,
          module.id,
          assessment.modules[module.id].evaluations,
        ),
      }),
      {} as Record<string, AggregatedAssessorStatistics>,
    );

    const totalScore = Object.values(moduleScores).reduce(
      (total, moduleScore) => total + moduleScore.weightedScore,
      0,
    );
    const factor = Math.pow(10, 2);

    return {
      assessmentId: assessment.assessmentId,
      totalScore: Math.ceil(totalScore * factor) / factor,
      moduleStatistics: moduleScores,
    };
  }

  public static changeAssessmentStructure(
    modules: ModuleState[],
    profile: ProfileState,
    assessment: AssessmentScores,
  ): AssessmentSummaryBreakdown {
    const profileModules = modules.filter((mod) => profile.weights[mod.id] > 0);

    return {
      assessmentId: assessment.assessmentId,
      modules: profileModules.reduce(
        (mm, module) => ({
          ...mm,
          [module.id]: {
            moduleId: module.id,
            evaluations: Object.values(assessment.evaluations).reduce(
              (ee, evaluation) => ({
                ...ee,
                [evaluation.evaluationId]: {
                  moduleId: module.id,
                  evaluationId: evaluation.evaluationId,
                  topics: evaluation.modules[module.id].topics,
                  notes: Object.values(
                    evaluation.modules[module.id].topics,
                  ).flatMap((topic) => topic.notes),
                },
              }),
              {} as Record<string, AssessorModuleScores>,
            ),
          },
        }),
        {} as Record<string, ModuleSummaryBreakdown>,
      ),
    } as AssessmentSummaryBreakdown;
  }
}
