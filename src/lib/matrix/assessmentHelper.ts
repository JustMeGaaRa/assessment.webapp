import type {
  AssessorModuleStatistics,
  AssessmentSessionStatistics,
  AssessmentModuleStatistics,
  Stats,
  Profile,
  ProficiencyLevel,
  CompetenceMatrix,
  CompetenceMatrixModule,
  SkillLevel,
} from "./types";
import {
  IndividualModuleScore,
  IndividualAssessmentScore,
  AssessmentSession,
} from "@lib/matrix/types";

function calculateModuleStatistics(
  profile: Profile,
  feedback: {
    type: "expert" | "self" | "llm";
    status?: "completed" | "ongoing" | "rejected";
  },
  assessorName: string,
  module: IndividualModuleScore | undefined,
): AssessorModuleStatistics {
  // NOTE: the module is undefined when assessor didn't provide any score in this module
  if (!module) {
    return {
      moduleId: "",
      moduleName: "",
      feedback,
      assessor: {
        fullname: assessorName,
      },
      statistics: {
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
    feedback,
    assessor: {
      fullname: assessorName,
    },
    statistics: {
      averageScore,
      weightedScore,
      weight,
    },
  };
}

export function calculateAssessorFeedbackScore(
  profile: Profile,
  feedback: {
    type: "expert" | "self" | "llm";
    status?: "completed" | "ongoing" | "rejected";
  },
  assessorName: string,
  assessorModuleScores: IndividualModuleScore[],
  proficiencyLevels: ProficiencyLevel[],
): Stats {
  const moduleStats = assessorModuleScores.map((module) =>
    calculateModuleStatistics(profile, feedback, assessorName, module),
  );

  const averageScore =
    moduleStats.reduce(
      (total, module) => total + module.statistics.averageScore,
      0,
    ) / moduleStats.length;
  const weightedScore = moduleStats.reduce(
    (total, module) => total + module.statistics.weightedScore,
    0,
  );
  const weight = moduleStats ? moduleStats[0]?.statistics.weight : 0;
  const proficiencyLevel = findProficiencyLevel(
    weightedScore,
    proficiencyLevels,
  );

  return {
    averageScore,
    weightedScore,
    weight,
    proficiencyLevel,
  };
}

// TODO: delete this legacy when migrated to UI version 2
export function calculateIndividualScore(
  profile: Profile,
  feedback: {
    type: "expert" | "self" | "llm";
    status?: "completed" | "ongoing" | "rejected";
  },
  feedbackModule: IndividualAssessmentScore,
  proficiencyLevels: ProficiencyLevel[],
): number {
  const stats = calculateAssessorFeedbackScore(
    profile,
    feedback,
    feedbackModule.assessor.fullname,
    feedbackModule.modules,
    proficiencyLevels,
  );
  return stats.weightedScore;
}

function calculateAssessmentModuleStatistics(
  profile: Profile,
  module: CompetenceMatrixModule,
  skillLevels: SkillLevel[],
  assessorFeedbacks: IndividualAssessmentScore[],
): AssessmentModuleStatistics {
  const feedbackTypeMap = new Map<string, "expert" | "self" | "llm">();
  const feedbackStatusMap = new Map<
    string,
    "completed" | "ongoing" | "rejected" | undefined
  >();
  assessorFeedbacks.forEach((feedback) => {
    feedbackTypeMap.set(feedback.feedbackId, feedback.type);
    feedbackStatusMap.set(feedback.feedbackId, feedback.status);
  });

  const moduleStatsPerAssessor = assessorFeedbacks.map((feedback) =>
    calculateModuleStatistics(
      profile,
      feedback,
      feedback.assessor.fullname,
      feedback.modules.find((x) => x.moduleId === module.moduleId),
    ),
  );
  const completedExpertFeedbacks = moduleStatsPerAssessor.filter(
    (module) =>
      module.feedback.type !== "self" && module.feedback.status === "completed",
  );

  const averageScore =
    completedExpertFeedbacks.length > 0
      ? completedExpertFeedbacks.reduce(
          (total, module) => total + module.statistics.averageScore,
          0,
        ) / completedExpertFeedbacks.length
      : 0;
  const weightedScore =
    completedExpertFeedbacks.length > 0
      ? completedExpertFeedbacks.reduce(
          (total, module) => total + module.statistics.weightedScore,
          0,
        ) / completedExpertFeedbacks.length
      : 0;
  const weight =
    moduleStatsPerAssessor.length > 0
      ? moduleStatsPerAssessor[0]?.statistics.weight
      : 0;
  const proficiencyLevel = findSkillLevel(averageScore, skillLevels);

  return {
    moduleId: module.moduleId,
    moduleName: module.moduleName,
    description: module.description,
    statistics: {
      averageScore,
      weightedScore,
      weight,
      proficiencyLevel,
    },
    assessorStats: moduleStatsPerAssessor.map((module) => ({
      assessor: module.assessor,
      module: module.statistics,
    })),
    notes: assessorFeedbacks
      .map((feedback) => {
        const notes = feedback.modules
          .filter((module) => module.moduleId === module.moduleId)
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
  proficiencyLevels: ProficiencyLevel[],
) {
  const targetProficiency = proficiencyLevels
    .sort((a, b) => b.scoreThreshold - a.scoreThreshold)
    .find((level) => totalScore >= level.scoreThreshold);
  return targetProficiency?.level;
}

function findSkillLevel(score: number, skillLevels: SkillLevel[]) {
  const targetSkillLevel = skillLevels
    .sort((a, b) => b.score - a.score)
    .find((level) => score >= level.score);
  return targetSkillLevel?.label;
}

export function calculateAssessmentStatistics(
  profile: Profile,
  matrix: CompetenceMatrix,
  proficiencyLevels: ProficiencyLevel[],
  skillLevels: SkillLevel[],
  assessment: AssessmentSession,
): AssessmentSessionStatistics {
  const profileModules = matrix.modules.filter(
    (module) =>
      (profile.modules.find((x) => x.moduleId === module.moduleId)?.weight ??
        0) > 0,
  );

  const nonSelfFeedbacks = assessment.feedbacks;

  const moduleScores = profileModules.map((module) =>
    calculateAssessmentModuleStatistics(
      profile,
      module,
      skillLevels,
      nonSelfFeedbacks,
    ),
  );

  const factor = Math.pow(10, 2);
  const totalScore = moduleScores.reduce(
    (total, moduleScore) => total + moduleScore.statistics.weightedScore,
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
