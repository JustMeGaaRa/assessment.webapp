import {
  AssessmentSession,
  CompetenceMatrix,
  ProficiencyLevel,
  Profile,
  SkillLevel,
} from "@lib/matrix";

export interface AppDataStateV2 {
  version: 2;
  timestamp: Date;
  matrix: CompetenceMatrix;
  proficiencyLevels: ProficiencyLevel[];
  profiles: Profile[];
  skillLevels: SkillLevel[];
  assessments: AssessmentSession[];
}
