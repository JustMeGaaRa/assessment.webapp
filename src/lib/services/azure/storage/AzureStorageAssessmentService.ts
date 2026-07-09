import { AssessmentSession, IndividualAssessmentScore } from "@lib/matrix";
import { AssessmentService } from "@lib/services/intext";
import assessment_backup from "./assessment_backup_2026-07-05.json";

export class AzureStorageAssessmentService implements AssessmentService {
  async getAssessments(): Promise<AssessmentSession[]> {
    return Promise.resolve(
      assessment_backup.assessments.map((a) => ({
        assessmentId: a.assessmentId,
        details: {
          candidate: a.details.candidate,
          date: new Date(a.details.date),
          profile: a.details.profile,
          stack: a.details.stack,
        },
        feedbacks: a.feedbacks.map((f) => ({
          feedbackId: f.feedbackId,
          type: f.type as "expert" | "self" | "llm",
          assessor: f.assessor,
          status: f.status as "ongoing" | "completed",
          date: new Date(f.date),
          modules: f.modules.map((m) => ({
            moduleId: m.moduleId,
            moduleName: m.moduleName,
            topics: m.topics.map((t) => ({
              topicId: t.topicId,
              topicName: t.topicName,
              score: t.score,
              reasoning: t.reasoning,
              notes: t.notes,
            })),
          })),
        })),
      })),
    );
  }
  async getAssessmentById(assessmentId: string): Promise<AssessmentSession> {
    const a = assessment_backup.assessments.find(
      (assessment) => assessment.assessmentId === assessmentId,
    );
    if (!a) return Promise.reject(new Error("Assessment not found"));
    return Promise.resolve({
      assessmentId: a.assessmentId,
      details: {
        candidate: a.details.candidate,
        date: new Date(a.details.date),
        profile: a.details.profile,
        stack: a.details.stack,
      },
      feedbacks: a.feedbacks.map((f) => ({
        feedbackId: f.feedbackId,
        type: f.type as "expert" | "self" | "llm",
        assessor: f.assessor,
        status: f.status as "ongoing" | "completed",
        date: new Date(f.date),
        modules: f.modules.map((m) => ({
          moduleId: m.moduleId,
          moduleName: m.moduleName,
          topics: m.topics.map((t) => ({
            topicId: t.topicId,
            topicName: t.topicName,
            score: t.score,
            reasoning: t.reasoning,
            notes: t.notes,
          })),
        })),
      })),
    });
  }
  getFeedbacks(assessmentId: string): Promise<IndividualAssessmentScore[]> {
    const a = assessment_backup.assessments.find(
      (assessment) => assessment.assessmentId === assessmentId,
    );
    if (!a) return Promise.reject(new Error("Assessment not found"));
    return Promise.resolve(
      a.feedbacks.map((f) => ({
        feedbackId: f.feedbackId,
        type: f.type as "expert" | "self" | "llm",
        assessor: f.assessor,
        status: f.status as "ongoing" | "completed",
        date: new Date(f.date),
        modules: f.modules.map((m) => ({
          moduleId: m.moduleId,
          moduleName: m.moduleName,
          topics: m.topics.map((t) => ({
            topicId: t.topicId,
            topicName: t.topicName,
            score: t.score,
            reasoning: t.reasoning,
            notes: t.notes,
          })),
        })),
      })),
    );
  }
  getFeedbackById(
    assessmentId: string,
    feedbackId: string,
  ): Promise<IndividualAssessmentScore> {
    const a = assessment_backup.assessments.find(
      (assessment) => assessment.assessmentId === assessmentId,
    );
    if (!a) return Promise.reject(new Error("Assessment not found"));
    const f = a.feedbacks.find(
      (feedback) => feedback.feedbackId === feedbackId,
    );
    if (!f) return Promise.reject(new Error("Feedback not found"));
    return Promise.resolve({
      feedbackId: f.feedbackId,
      type: f.type as "expert" | "self" | "llm",
      assessor: f.assessor,
      status: f.status as "ongoing" | "completed",
      date: new Date(f.date),
      modules: f.modules.map((m) => ({
        moduleId: m.moduleId,
        moduleName: m.moduleName,
        topics: m.topics.map((t) => ({
          topicId: t.topicId,
          topicName: t.topicName,
          score: t.score,
          reasoning: t.reasoning,
          notes: t.notes,
        })),
      })),
    });
  }
}
