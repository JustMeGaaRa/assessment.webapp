import {
  ModuleState,
  AssessorFeedbackState,
  AssessmentSessionState,
  ProfileState,
  ProficiencyLevelState,
  AppDataStateV1,
} from "@lib/state/v1";
import {
  IndividualModuleScore,
  IndividualAssessmentScore,
  AssessmentSession,
  Profile,
  CompetenceMatrix,
  TopicDefinition,
  TechnologyTopic,
  TechnologyStack,
  ProficiencyLevel,
  IndividualTopicScore,
} from "@lib/matrix/types";
import { AppDataStateV2 } from "./types";

export function getProficiencyLevel(
  levelMapping: ProficiencyLevelState,
): ProficiencyLevel {
  return {
    level: levelMapping.level,
    description: "<no_description_available>",
    scoreThreshold: levelMapping.minScore,
    title: levelMapping.level,
  };
}

export function getProfile(profileState: ProfileState): Profile {
  return {
    profileId: profileState.id,
    profileName: profileState.title,
    stack: profileState.stack,
    description: profileState.description,
    modules: Object.entries(profileState.weights).map(([module, weight]) => ({
      moduleId: module,
      weight: weight,
    })),
  };
}

export function getCompetencyMatrix(
  modulesState: ModuleState[],
): CompetenceMatrix {
  const uniqueStackNames = new Set(
    modulesState.flatMap((module) =>
      module.topics.flatMap((topic) => Object.keys(topic.mappings)),
    ),
  );

  const stacks = Array.from(uniqueStackNames).map(
    (stackName) =>
      ({
        stackName,
        topics: modulesState
          .flatMap((x) => x.topics)
          .map(
            (topic) =>
              ({
                topicId: topic.id,
                topicName: topic.name,
                type: "technology-topic",
                technologyDescription: topic.mappings[stackName],
              }) satisfies TechnologyTopic,
          ),
      }) satisfies TechnologyStack,
  );

  const modules = modulesState.map((module) => ({
    moduleId: module.id,
    moduleName: module.title,
    description: module.description,
    topics: module.topics.map(
      (topic) =>
        ({
          topicId: topic.id,
          topicName: topic.name,
          type: "topic-definition",
          description: "<no_description_available>",
        }) satisfies TopicDefinition,
    ),
  }));

  return { modules, stacks } satisfies CompetenceMatrix;
}

export function getApplicationState(appState: AppDataStateV1): AppDataStateV2 {
  return {
    version: 2,
    timestamp: new Date(),
    matrix: getCompetencyMatrix(appState.library.matrix),
    proficiencyLevels:
      appState.library.levelMappings?.map(getProficiencyLevel) ?? [],
    skillLevels: [],
    profiles: appState.library.profiles.map(getProfile),
    assessments: appState.assessments.map(
      (x) =>
        ({
          assessmentId: x.id,
          details: {
            candidate: {
              fullname: x.candidateName,
            },
            date: new Date(x.date),
            profile: {
              profileId: x.profileId,
              title: x.profileTitle,
            },
            stack: x.stack,
          },
          feedbacks: appState.evaluations
            .filter((y) => y.assessmentId === x.id)
            .map((y) => ({
              feedbackId: y.id,
              type: "expert",
              assessor: {
                fullname: y.assessorName ?? "Anonymous",
              },
              status: y.status,
              date: new Date(y.date),
              modules: appState.library.matrix.map(
                (module) =>
                  ({
                    moduleId: module.id,
                    moduleName: module.title,
                    topics: module.topics.map(
                      (topic) =>
                        ({
                          topicId: topic.id,
                          topicName: topic.name,
                          score: y.scores[topic.id] ?? 0,
                          notes: y.notes[topic.id] ?? "",
                        }) satisfies IndividualTopicScore,
                    ),
                  }) satisfies IndividualModuleScore,
              ),
            })),
        }) satisfies AssessmentSession,
    ),
  };
}

function getIndividualFeedbackScores(
  modulesState: CompetenceMatrix,
  feedbackState: AssessorFeedbackState,
): IndividualAssessmentScore {
  return {
    feedbackId: feedbackState.id,
    type: "expert",
    assessor: {
      fullname: feedbackState.assessorName ?? "Anonymous",
    },
    status: feedbackState.status,
    date: new Date(feedbackState.date),
    modules: getIndividualModuleScores(modulesState, feedbackState),
  };
}

export function getIndividualModuleScores(
  modulesState: CompetenceMatrix,
  feedbackState: AssessorFeedbackState,
): IndividualModuleScore[] {
  return modulesState.modules.map((module) => ({
    moduleId: module.moduleId,
    moduleName: module.moduleName,
    topics: module.topics.map((topic) => ({
      topicId: topic.topicId,
      topicName: topic.topicName,
      score: feedbackState.scores[topic.topicId],
      notes: feedbackState.notes[topic.topicId],
    })),
  }));
}

export function getAssessmentSession(
  assessmentState: AssessmentSessionState,
  modulesState: CompetenceMatrix,
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
    feedbacks: feedbackState
      .filter((x) => x.assessmentId === assessmentState.id)
      .map(
        (evaluation) => getIndividualFeedbackScores(modulesState, evaluation),
        {},
      ),
  };
}
