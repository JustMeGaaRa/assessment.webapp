export interface Topic {
  id: string;
  name: string;
  weight: number;
  mappings: Record<string, string>;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

export interface Profile {
  id: string;
  title: string;
  stack: string;
  description: string;
  weights: Record<string, number>;
}

export interface AppData {
  matrix: Module[];
  profiles: Profile[];
  stacks: Record<string, string>;
}

export type FileStatus = "idle" | "uploading" | "parsing" | "done" | "error";

export interface AssessmentSession {
  id: string;
  candidateName: string;
  profileId: string;
  profileTitle: string;
  stack: string;
  date: string;
  locked?: boolean;
}

export interface AssessorEvaluation {
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
