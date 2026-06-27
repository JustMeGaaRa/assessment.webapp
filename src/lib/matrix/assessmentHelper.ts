import type {
  AssessorModuleStatistics,
  AssessmentSessionStatistics,
  AssessmentModuleStatistics,
  Stats,
} from "./types";
import {
  ProficiencyLevelState,
  ModuleState,
  ProfileState,
  AssessorFeedbackState,
  AssessmentSessionState,
} from "../../types";
import {
  IndividualModuleScore,
  IndividualAssessmentScore,
  AssessmentSession,
} from "@lib/matrix/types";

export function getIndividualFeedbackScores(
  modulesState: ModuleState[],
  feedbackState: AssessorFeedbackState,
): IndividualAssessmentScore {
  return {
    feedbackId: feedbackState.id,
    assessor: {
      fullname: feedbackState.assessorName ?? "Anonymous",
    },
    modules: getIndividualModuleScores(modulesState, feedbackState),
  };
}

export function getIndividualModuleScores(
  modulesState: ModuleState[],
  feedbackState: AssessorFeedbackState,
): IndividualModuleScore[] {
  return modulesState.map((module) => ({
    moduleName: module.id,
    topics: module.topics.map((topic) => ({
      topicName: topic.name,
      score: feedbackState.scores[topic.id],
      notes: feedbackState.notes[topic.id],
    })),
  }));
}

export function getAssessmentSession(
  assessmentState: AssessmentSessionState,
  modulesState: ModuleState[],
  feedbackState: AssessorFeedbackState[],
): AssessmentSession {
  return {
    assessmentId: assessmentState.id,
    details: {
      date: new Date(assessmentState.date),
      candidate: {
        fullname: assessmentState.candidateName,
      },
      profile: {
        profileId: assessmentState.profileId,
        title: assessmentState.profileTitle,
      },
      stack: assessmentState.stack,
    },
    feedbacks: feedbackState.map(
      (evaluation) => getIndividualFeedbackScores(modulesState, evaluation),
      {},
    ),
  };
}

export function calculateModuleStatistics(
  profileState: ProfileState,
  assessorName: string,
  module: IndividualModuleScore | undefined,
): AssessorModuleStatistics {
  // NOTE: the module is undefined when assessor didn't provide any score in this module
  if (!module) {
    return {
      moduleName: "",
      assessorName: assessorName,
      stats: {
        averageScore: 0,
        weightedScore: 0,
        weight: 0,
      },
    };
  }

  const totalScore = module.topics.reduce(
    (total, topic) => total + (topic.score ?? 0),
    0,
  );
  const scoredTopics = module.topics.length;
  const averageScore = scoredTopics > 0 ? totalScore / scoredTopics : 0;
  const weight = profileState.weights[module.moduleName] || 0;
  const weightedScore = (averageScore * weight) / 100;

  return {
    moduleName: module.moduleName,
    assessorName: assessorName,
    stats: {
      averageScore,
      weightedScore,
      weight,
    },
  };
}

export function calculateAssessorFeedbackScore(
  profileState: ProfileState,
  assessorName: string,
  assessorModuleScores: IndividualModuleScore[],
): Stats {
  const moduleStats = assessorModuleScores.map((feedback) =>
    calculateModuleStatistics(profileState, assessorName, feedback),
  );

  return {
    averageScore:
      moduleStats.reduce(
        (total, module) => total + module.stats.averageScore,
        0,
      ) / moduleStats.length,
    weightedScore:
      moduleStats.reduce(
        (total, module) => total + module.stats.weightedScore,
        0,
      ) / moduleStats.length,
    weight: moduleStats ? moduleStats[0]?.stats.weight : 0,
  };
}

function calculateAssessmentModuleStatistics(
  profileState: ProfileState,
  moduleId: string,
  assessorFeedbacks: IndividualAssessmentScore[],
): AssessmentModuleStatistics {
  const moduleStatsPerAssessor = assessorFeedbacks.map((feedback) =>
    calculateModuleStatistics(
      profileState,
      feedback.assessor.fullname,
      feedback.modules.find((x) => x.moduleName === moduleId),
    ),
  );

  return {
    moduleName: moduleId,
    stats: {
      averageScore:
        moduleStatsPerAssessor.reduce(
          (total, module) => total + module.stats.averageScore,
          0,
        ) / moduleStatsPerAssessor.length,
      weightedScore:
        moduleStatsPerAssessor.reduce(
          (total, module) => total + module.stats.weightedScore,
          0,
        ) / moduleStatsPerAssessor.length,
      weight: moduleStatsPerAssessor
        ? moduleStatsPerAssessor[0]?.stats.weight
        : 0,
    },
    assessorStats: moduleStatsPerAssessor.map((module) => ({
      assessor: {
        fullname: module.assessorName,
      },
      module: module.stats,
    })),
    notes: assessorFeedbacks
      .map((feedback) => {
        const notes = feedback.modules
          .filter((module) => module.moduleName === moduleId)
          .flatMap((x) => x.topics.flatMap((y) => y.notes))
          .filter((note) => note !== undefined && note !== "");
        return notes.length > 0
          ? `${feedback.assessor.fullname}: ${notes.join("; ")}`
          : undefined;
      })
      .filter((note) => note !== undefined),
  };
}

function findProficiencyLevel(
  totalScore: number,
  proficiencyLevels: ProficiencyLevelState[] | undefined,
) {
  const targetProficiency = proficiencyLevels?.find(
    (level) => totalScore >= level.minScore && totalScore < level.maxScore,
  );
  return targetProficiency?.level;
}

export function calculateAssessmentStatistics(
  profile: ProfileState,
  modules: ModuleState[],
  proficiencyLevels: ProficiencyLevelState[] | undefined,
  assessment: AssessmentSession,
): AssessmentSessionStatistics {
  const profileModules = modules.filter(
    (module) => profile.weights[module.id] > 0,
  );

  const moduleScores = profileModules.map((module) =>
    calculateAssessmentModuleStatistics(
      profile,
      module.id,
      assessment.feedbacks,
    ),
  );

  const factor = Math.pow(10, 2);
  const totalScore = moduleScores.reduce(
    (total, moduleScore) => total + moduleScore.stats.weightedScore,
    0,
  );
  const totalScoreRounded = Math.ceil(totalScore * factor) / factor;

  return {
    assessmentId: assessment.assessmentId,
    details: assessment.details,
    summary: {
      proficiencyLevel: findProficiencyLevel(
        totalScoreRounded,
        proficiencyLevels,
      ),
      totalScore: totalScoreRounded,
    },
    modules: moduleScores,
  };
}
