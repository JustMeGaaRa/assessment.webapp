// MATRIX TYPES
export interface SkillLevel {
  score: number;
  label: string;
  description: string;
  example?: string;
  criteria: string;
}

export interface ProficiencyLevel {
  // TODO: add attributes
  level: string;
}

export interface GenericTopic {
  topicName: string;
  genericDescription: string;
}

export interface TechnologyTopic {
  topicName: string;
  technologyDescription: string;
}

export interface TechnologyStack {
  stackName: string;
  topics: TechnologyTopic[];
}

export interface CompetencyMatrix {
  topics: GenericTopic[];
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
  topicName: string;
  score: number;
  reasoning?: string;
  notes: string;
}

export interface IndividualModuleScore {
  moduleName: string;
  topics: Array<IndividualTopicScore>;
}

export interface IndividualAssessmentScore {
  feedbackId: string;
  assessor: {
    fullname: string;
  };
  modules: Array<IndividualModuleScore>;
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

export interface AssessorModuleStatistics {
  moduleName: string;
  assessorName: string;
  stats: Stats;
}

export interface AssessmentModuleStatistics {
  moduleName: string;
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
