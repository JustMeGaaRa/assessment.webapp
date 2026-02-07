export interface Topic {
  id: string;
  name: string;
  weight: number;
  mappings: Record<string, string>;
}

export interface ModuleState {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

export interface ProfileState {
  id: string;
  title: string;
  stack: string;
  description: string;
  weights: Record<string, number>;
}

export interface LevelMapping {
  level: string;
  minScore: number;
  maxScore: number;
}

export interface AppDataState {
  matrix: ModuleState[];
  profiles: ProfileState[];
  stacks: string[];
  levelMappings?: LevelMapping[];
}

export type FileStatus = "idle" | "uploading" | "parsing" | "done" | "error";

// WARNING: do not change, this is used to load state from localStorage
export interface AssessmentSessionState {
  id: string;
  candidateName: string;
  profileId: string;
  profileTitle: string;
  stack: string;
  date: string;
  locked?: boolean;
}

// WARNING: do not change, this is used to load state from localStorage
export interface AssessorEvaluationState {
  id: string; // Evaluation ID
  assessmentId: string; // Link to AssessmentSession
  assessorName?: string; // Optional if not set yet
  // Snapshot data (can be removed if we fully normalize, but keeping for safety/export)
  candidateName: string;
  profileId: string;
  profileTitle: string;
  stack: string;

  date: string;
  status: "ongoing" | "completed" | "rejected";

  scores: Record<string, number>; // { topicId, score }
  notes: Record<string, string>; // { topicId, note }
  finalScore?: number;
}

// types that represent assessor scoring hierarchy
export interface AssessorTopicScore {
  topicId: string;
  score: number;
  notes: string;
}

export interface AssessorModuleScores {
  moduleId: string;
  evaluationId: string;
  topics: Record<string, AssessorTopicScore>;
}

export interface AssessorEvaluationScores {
  evaluationId: string;
  modules: Record<string, AssessorModuleScores>;
}

export interface AssessmentScores {
  assessmentId: string;
  evaluations: Record<string, AssessorEvaluationScores>;
}

// types that represent assessment summary hierarchy
export interface ModuleSummaryBreakdown {
  moduleId: string;
  evaluations: Record<string, AssessorModuleScores>;
}

export interface AssessmentSummaryBreakdown {
  assessmentId: string;
  modules: Record<string, ModuleSummaryBreakdown>;
}

// calculated statistics
export interface AssessorEvaluationModuleStatistics {
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
  assessorEvaluationStatistics: Record<
    string,
    AssessorEvaluationModuleStatistics
  >;
}

export interface AssessmentStatistics {
  assessmentId: string;
  totalScore: number;
  moduleStatistics: Record<string, AggregatedAssessorStatistics>;
}
