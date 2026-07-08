// MATRIX TYPES
export interface SkillLevel {
  score: number;
  label: string;
  description: string;
  example?: string;
  criteria: string;
}

export interface ProficiencyLevel {
  level: string;
  title: string;
  scoreThreshold: number;
  description: string;
}

export interface Profile {
  profileId: string;
  profileName: string;
  stack?: string;
  description?: string;
  modules: Array<{
    moduleId: string;
    weight: number;
  }>;
}

export interface TopicDefinition {
  type: "topic-definition";
  topicId: string;
  topicName: string;
  description: string;
}

export interface TechnologyTopic {
  type: "technology-topic";
  topicId: string;
  topicName: string;
  technologyDescription: string;
}

export interface TechnologyStack {
  stackName: string;
  topics: TechnologyTopic[];
}

export interface CompetenceMatrixModule {
  moduleId: string;
  moduleName: string;
  description?: string;
  topics: TopicDefinition[];
}

export interface CompetenceMatrix {
  modules: CompetenceMatrixModule[];
  stacks: TechnologyStack[];
}

// ASSESSMENT TYPES
export interface AssessmentDetails {
  stack: string;
  profile: {
    title: string;
    profileId: string;
  };
  date: Date;
  candidate: {
    fullname: string;
  };
}

export interface IndividualTopicScore {
  topicId: string;
  topicName: string;
  score: number;
  reasoning?: string;
  notes: string;
}

export interface IndividualModuleScore {
  moduleId: string;
  moduleName: string;
  topics: Array<IndividualTopicScore>;
}

export interface IndividualAssessmentScore {
  feedbackId: string;
  type: "expert" | "self" | "llm";
  assessor: {
    fullname: string;
  };
  modules: Array<IndividualModuleScore>;
  status?: "ongoing" | "completed" | "rejected";
  date?: Date;
}

export interface AssessmentSession {
  assessmentId: string;
  details: AssessmentDetails;
  feedbacks: Array<IndividualAssessmentScore>;
}

export interface ConsolidatedAssessmentSummary {
  assessmentId: string;
  details: AssessmentDetails;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    weightedScore: number;
    weight: number;
    notes: string[];
  }>;
  summary: {
    proficiencyLevel: string;
    totalScore: number;
  };
}

// STATISTICS
export interface Stats {
  averageScore: number;
  weightedScore: number;
  weight: number;
}

export type IndividualAssessmentStats = IndividualAssessmentScore & {
  stats: Stats;
};

export interface AssessorModuleStatistics {
  moduleId: string;
  moduleName: string;
  assessorName: string;
  stats: Stats;
}

export interface AssessmentModuleStatistics {
  moduleId: string;
  moduleName: string;
  description?: string;
  assessorStats: Array<{
    assessor: {
      fullname: string;
    };
    module: Stats;
  }>;
  notes: string[];
  stats: Stats;
}

export interface AssessmentSessionStatistics {
  assessmentId: string;
  details: AssessmentDetails;
  modules: AssessmentModuleStatistics[];
  summary: {
    proficiencyLevel?: string;
    totalScore: number;
  };
}

// CONSOLIDATED TYPES
// class AssessmentSessionResult {
//   public constructor(public readonly session: AssessmentSession) {}
// }

// const assessment: AssessmentSessionResult = new AssessmentSessionResult({

// })
