export interface SkillLevel {
  score: number;
  label: string;
  description: string;
  example: string;
  criteria: string;
}

export interface ProficiencyLevel {
  // TODO: add attributes
  level: string;
}

export interface CompetencyMatrix {
  topics: GenericTopic[];
  stacks: TechnologyStack[];
}

export interface GenericTopic {
  topicName: string;
}

export interface TechnologyTopic {
  topicName: string;
  technologyDescription: string;
}

export interface TechnologyStack {
  stackName: string;
  topics: TechnologyTopic[];
}

export interface AssessmentDetails {
  stack: string;
  profile: string;
  date: Date;
  candidate: string;
}

export interface AssessmentSession {
  details: AssessmentDetails;
  scores: IndividualAssessmentScore;
}

export interface IndividualAssessmentScore {
  topics: Array<{
    name: string;
    score: number;
    reasoning: string;
    notes: string[];
  }>;
}

export interface ConsolidatedAssessmentSummary {
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
