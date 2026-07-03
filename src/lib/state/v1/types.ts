export interface TopicState {
  id: string;
  name: string;
  weight: number;
  mappings: Record<string, string>;
}

export interface ModuleState {
  id: string;
  title: string;
  description: string;
  topics: TopicState[];
}

export interface ProfileState {
  id: string;
  title: string;
  stack: string;
  description: string;
  weights: Record<string, number>;
}

export interface ProficiencyLevelState {
  level: string;
  minScore: number;
  maxScore: number;
}

export interface MatrixDataState {
  matrix: ModuleState[];
  profiles: ProfileState[];
  stacks: string[];
  levelMappings?: ProficiencyLevelState[];
}

export interface AppDataStateV1 {
  version: number;
  timestamp: Date;
  library: MatrixDataState;
  assessments: AssessmentSessionState[];
  evaluations: AssessorFeedbackState[];
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
export interface AssessorFeedbackState {
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
  hostId?: string; // Optional: Link to host if this is a guest view
}
