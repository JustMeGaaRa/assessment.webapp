import {
  AssessmentSession,
  CompetenceMatrix,
  IndividualAssessmentScore,
  ProficiencyLevel,
  Profile,
  SkillLevel,
} from "@/lib/matrix";

export interface AssessmentService {
  getAssessments(): Promise<AssessmentSession[]>;
  getAssessmentById(assessmentId: string): Promise<AssessmentSession>;
  getFeedbacks(assessmentId: string): Promise<IndividualAssessmentScore[]>;
  getFeedbackById(
    assessmentId: string,
    feedbackId: string,
  ): Promise<IndividualAssessmentScore>;
}

export interface SkillLevelService {
  getSkillLevels(): Promise<SkillLevel[]>;
}

export interface CompetenceMatrixService {
  getCompetenceMatrix(): Promise<CompetenceMatrix>;
}

export interface JobProfileService {
  getJobProfiles(): Promise<Profile[]>;
  getJobProfileById(profileId: string): Promise<Profile>;
}

export interface ProficiencyLevelService {
  getProficiencyLevels(): Promise<ProficiencyLevel[]>;
}
