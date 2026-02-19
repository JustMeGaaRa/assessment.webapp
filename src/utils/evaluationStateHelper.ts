import type { AssessmentSessionState, AssessorEvaluationState, ModuleState } from "../types";
import type { AssessmentScores, AssessorEvaluationScores, AssessorModuleScores, AssessorTopicScore } from "../types";

export class EvaluationStateHelper {
  public static mapEvaluationToModuleScore(
    modules: ModuleState[],
    evaluation: AssessorEvaluationState,
  ) {
    return modules.reduce(
      (acc, module) => ({
        ...acc,
        [module.id]: {
          moduleId: module.id,
          evaluationId: evaluation.id,
          topics: module.topics.reduce(
            (acc, topic) => ({
              ...acc,
              [topic.id]: {
                topicId: topic.id,
                score: evaluation.scores[topic.id],
                notes: evaluation.notes[topic.id],
              },
            }),
            {} as Record<string, AssessorTopicScore>,
          ),
        },
      }),
      {} as Record<
        string,
        AssessorModuleScores
      >,
    );
  }
  
  public static mapEvaluationStateToAssessorScore(
    evaluation: AssessorEvaluationState,
    matrix: ModuleState[],
  ): AssessorEvaluationScores {
    return {
      evaluationId: evaluation.id,
      modules: matrix.reduce(
        (mm, module) => ({
          ...mm,
          [module.id]: {
            moduleId: module.id,
            topics: module.topics.reduce(
              (tt, topic) => ({
                ...tt,
                [topic.id]: {
                  topicId: topic.id,
                  score: evaluation.scores[topic.id],
                  notes: evaluation.notes[topic.id],
                },
              }),
              {},
            ),
          },
        }),
        {},
      ),
    };
  }
  
  public static mapEvaluationStateToAssessmentFeedback(
    assessment: AssessmentSessionState,
    evaluations: AssessorEvaluationState[],
    matrix: ModuleState[],
  ): AssessmentScores {
    return {
      assessmentId: assessment.id,
      date: new Date(assessment.date),
      candidate: {
        name: assessment.candidateName
      },
      profile: {
        profileId: assessment.profileId,
        title: assessment.profileTitle
      },
      stack: {
        name: assessment.stack
      },
      evaluations: evaluations.reduce(
        (ee, evaluation) => ({
          ...ee,
          [evaluation.id]: this.mapEvaluationStateToAssessorScore(evaluation, matrix),
        }),
        {},
      ),
    };
  }
}
