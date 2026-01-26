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
