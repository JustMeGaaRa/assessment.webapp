import type {
  AssessorModuleStatistics,
  AssessmentSessionStatistics,
  AssessmentModuleStatistics,
  Stats,
  Profile,
  ProficiencyLevel,
  CompetenceMatrix,
} from "./types";
import {
  IndividualModuleScore,
  IndividualAssessmentScore,
  AssessmentSession,
} from "@lib/matrix/types";

function calculateModuleStatistics(
  profile: Profile,
  assessorName: string,
  module: IndividualModuleScore | undefined,
): AssessorModuleStatistics {
  // NOTE: the module is undefined when assessor didn't provide any score in this module
  if (!module) {
    return {
      moduleId: "",
      moduleName: "",
      assessorName: assessorName,
      stats: {
        averageScore: 0,
        weightedScore: 0,
        weight: 0,
      },
    };
  }

  const nonZeroTopics = module.topics.filter(
    (topic) => topic.score !== undefined && topic.score !== 0,
  );
  const totalScore = nonZeroTopics.reduce(
    (total, topic) => total + (topic.score ?? 0),
    0,
  );
  const scoredTopics = nonZeroTopics.length;
  const averageScore = scoredTopics > 0 ? totalScore / scoredTopics : 0;
  const weight =
    profile.modules.find((x) => x.moduleId === module.moduleId)?.weight ?? 0;
  const weightedScore = (averageScore * weight) / 100.0;

  return {
    moduleId: module.moduleId,
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
  profileState: Profile,
  assessorName: string,
  assessorModuleScores: IndividualModuleScore[],
): Stats {
  const moduleStats = assessorModuleScores.map((module) =>
    calculateModuleStatistics(profileState, assessorName, module),
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
      ),
    weight: moduleStats ? moduleStats[0]?.stats.weight : 0,
  };
}

export function calculateIndividualScore(
  profile: Profile,
  evaluation: IndividualAssessmentScore,
): number {
  const stats = calculateAssessorFeedbackScore(
    profile,
    evaluation.assessor.fullname,
    evaluation.modules,
  );
  return stats.weightedScore;
}

function calculateAssessmentModuleStatistics(
  profileState: Profile,
  moduleId: string,
  assessorFeedbacks: IndividualAssessmentScore[],
): AssessmentModuleStatistics {
  const moduleStatsPerAssessor = assessorFeedbacks.map((feedback) =>
    calculateModuleStatistics(
      profileState,
      feedback.assessor.fullname,
      feedback.modules.find((x) => x.moduleId === moduleId),
    ),
  );

  return {
    moduleId: moduleId,
    moduleName: moduleId,
    stats: {
      averageScore:
        moduleStatsPerAssessor.length > 0
          ? moduleStatsPerAssessor.reduce(
              (total, module) => total + module.stats.averageScore,
              0,
            ) / moduleStatsPerAssessor.length
          : 0,
      weightedScore:
        moduleStatsPerAssessor.length > 0
          ? moduleStatsPerAssessor.reduce(
              (total, module) => total + module.stats.weightedScore,
              0,
            ) / moduleStatsPerAssessor.length
          : 0,
      weight: moduleStatsPerAssessor.length > 0
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
          .filter((module) => module.moduleId === moduleId)
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
  proficiencyLevels: ProficiencyLevel[] | undefined,
) {
  const targetProficiency = proficiencyLevels
    ?.sort((a, b) => b.scoreThreshold - a.scoreThreshold)
    ?.find((level) => totalScore >= level.scoreThreshold);
  return targetProficiency?.level;
}

export function calculateAssessmentStatistics(
  profile: Profile,
  modules: CompetenceMatrix,
  proficiencyLevels: ProficiencyLevel[] | undefined,
  assessment: AssessmentSession,
): AssessmentSessionStatistics {
  const profileModules = modules.modules.filter(
    (module) =>
      (profile.modules.find((x) => x.moduleId === module.moduleId)?.weight ??
        0) > 0,
  );

  const nonSelfFeedbacks = assessment.feedbacks.filter((f) => f.type !== "self");

  const moduleScores = profileModules.map((module) =>
    calculateAssessmentModuleStatistics(
      profile,
      module.moduleId,
      nonSelfFeedbacks,
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
