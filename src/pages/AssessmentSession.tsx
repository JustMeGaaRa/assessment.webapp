import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Lock, Unlock } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Modal } from "../components/ui/Modal";
import type {
  AssessmentSession,
  AssessorEvaluation,
  Module,
  Profile,
} from "../types";
import { importSessionFromJSON } from "../utils/fileHelpers";
import { NewAssessmentCard } from "../components/dashboard/NewAssessmentCard";
import { ImportAssessmentCard } from "../components/dashboard/ImportAssessmentCard";
import { AssessmentEvaluationCard } from "../components/dashboard/AssessmentEvaluationCard";
import {
  AssessmentSummaryCard,
  type AssessmentResult,
} from "../components/assessment/AssessmentSummaryCard";
import { AssessmentHelper } from "../utils/assessmentHelper";

interface AssessmentSessionPageProps {
  assessment?: AssessmentSession; // The group object
  evaluations: AssessorEvaluation[]; // The evaluations
  onCreateSession: (session: AssessorEvaluation) => void;
  onUpdateAssessment: (id: string, data: Partial<AssessmentSession>) => void;
  onUpdateSession: (id: string, data: Partial<AssessorEvaluation>) => void; // Keeping for potential future use or cleanup
  matrix: Module[];
  profile: Profile;
  assessorName: string;
}

export const AssessmentSessionPage = ({
  assessment,
  evaluations,
  onCreateSession,
  onUpdateAssessment,
  assessorName,
  matrix,
  profile,
}: AssessmentSessionPageProps) => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  // Filter evaluations for this assessment
  const assessmentEvaluations = evaluations.filter(
    (evaluation) => evaluation.assessmentId === assessmentId,
  );

  const candidateName = assessment?.candidateName || "Unknown Candidate";
  const isLocked = assessment?.locked || false;
  const colors = [
    {
      color: "bg-indigo-500",
      text: "text-indigo-600",
      light: "bg-indigo-50",
    },
    {
      color: "bg-emerald-500",
      text: "text-emerald-600",
      light: "bg-emerald-50",
    },
    {
      color: "bg-amber-500",
      text: "text-amber-600",
      light: "bg-amber-50",
    },
    {
      color: "bg-pink-500",
      text: "text-pink-600",
      light: "bg-pink-50",
    },
    {
      color: "bg-blue-500",
      text: "text-blue-600",
      light: "bg-blue-50",
    },
  ];

  const handleToggleLock = () => {
    if (!assessment) return;
    const newLockState = !isLocked;
    const confirmMsg = newLockState
      ? "Are you sure you want to LOCK this assessment session? No further evaluations can be added."
      : "Are you sure you want to UNLOCK this assessment session?";

    if (window.confirm(confirmMsg)) {
      onUpdateAssessment(assessment.id, { locked: newLockState });
    }
  };

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    if (!assessorName.trim()) {
      alert("Assessor name is missing.");
      return;
    }

    if (!assessment) {
      alert("No assessment context found.");
      return;
    }

    const newEvaluationId = crypto.randomUUID();
    const newSession: AssessorEvaluation = {
      id: newEvaluationId,
      assessmentId: assessment.id,
      candidateName: assessment.candidateName,
      profileId: assessment.profileId,
      profileTitle: assessment.profileTitle,
      stack: assessment.stack,
      assessorName: assessorName,
      status: "ongoing",
      scores: {},
      notes: {},
      date: new Date().toISOString(),
      finalScore: undefined,
    };

    onCreateSession(newSession);
    setIsAddModalOpen(false);
    navigate(`/assessment/${assessmentId}/evaluation/${newEvaluationId}`);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (!file) return;

    importSessionFromJSON(file)
      .then((importedSession) => {
        // Ensure imported session links to this assessment
        const newSession: AssessorEvaluation = {
          ...importedSession,
          id: crypto.randomUUID(),
          assessmentId: assessmentId || "",
          // Ensure consistency with the group
          candidateName:
            assessment?.candidateName || importedSession.candidateName,
          profileId: assessment?.profileId || importedSession.profileId,
          profileTitle:
            assessment?.profileTitle || importedSession.profileTitle,
          stack: assessment?.stack || importedSession.stack,
        };
        onCreateSession(newSession);
        alert("Evaluation imported successfully.");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to import evaluation.");
      })
      .finally(() => {
        if (e.target) e.target.value = "";
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold group"
            >
              <div className="p-1 rounded-full group-hover:bg-slate-100 transition-colors">
                <ArrowLeft size={20} />
              </div>
              <span>Back to Dashboard</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {assessment && (
              <button
                onClick={handleToggleLock}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-sm ${
                  isLocked
                    ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                <span>{isLocked ? "Session Locked" : "Session Unlocked"}</span>
              </button>
            )}
          </div>
        </div>

        <PageHeader
          icon={<User className="text-indigo-600 w-8 h-8" />}
          title="Assessment Session"
          description="An overview of the assessment session"
        />

        {/* Assessment Summary Section */}
        {assessment && assessmentEvaluations.length > 0 && (
          <div className="grid grid-cols-1 gap-10 mb-10">
            {(() => {
              // Prepare assessors data
              const assessors = assessmentEvaluations.map((ev, idx) => {
                const style = colors[idx % colors.length];
                return {
                  id: ev.id,
                  name: ev.assessorName || `Assessor ${idx + 1}`,
                  color: style.color,
                  text: style.text,
                  light: style.light,
                };
              });

              // Prepare scores: [ModuleID] -> { [EvaluationId] -> Score }
              const resultScores: Record<string, Record<string, number>> = {};

              // Helper to calculate module average for a session
              const getModuleScore = (
                session: AssessorEvaluation,
                moduleId: string,
              ) => {
                if (!profile) return 0;
                const helper = new AssessmentHelper(session, matrix, profile);
                const summary = helper.calculate();
                const moduleScores = summary.moduleScores[moduleId];
                return moduleScores ? moduleScores.averageScore : 0;
              };

              matrix.forEach((module) => {
                resultScores[module.id] = {};
                assessmentEvaluations.forEach((evaluation) => {
                  resultScores[module.id][evaluation.id] = getModuleScore(
                    evaluation,
                    module.id,
                  );
                });
              });

              // Prepare notes: Just aggregating or taking first (Logic can be improved)
              // Currently AssessmentResult expects one note per module.
              // We'll join notes from different assessors if available.
              const resultNotes: Record<string, string> = {};
              matrix.forEach((module) => {
                const notesList: string[] = [];
                assessmentEvaluations.forEach((evaluation) => {
                  // Find if there is a note for this module or topics within?
                  // Current AssessorEvaluation stores notes by TopicID.
                  // We need to see if we aggregate topic notes or if we change UI to support module notes.
                  // For now, let's look for any topic note in this module.
                  const moduleTopicIds = module.topics.map((topic) => topic.id);
                  const relevantNotes = Object.entries(evaluation.notes)
                    .filter(([k, v]) => moduleTopicIds.includes(k) && v)
                    .map(([, v]) => v);

                  if (relevantNotes.length > 0) {
                    notesList.push(
                      `${evaluation.assessorName}: ${relevantNotes.join(". ")}`,
                    );
                  }
                });
                if (notesList.length > 0) {
                  resultNotes[module.id] = notesList.join("\n\n");
                }
              });

              const assessmentResult: AssessmentResult = {
                id: assessment.id,
                candidateName: assessment.candidateName,
                profileId: assessment.profileId,
                profileName: assessment.profileTitle,
                stack: assessment.stack,
                date: new Date(assessment.date).toLocaleDateString(),
                assessors,
                evaluations: assessmentEvaluations,
                scores: resultScores,
                notes: resultNotes,
              };

              return (
                <AssessmentSummaryCard
                  key={assessmentResult.id}
                  result={assessmentResult}
                  profile={profile}
                  matrix={matrix}
                />
              );
            })()}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {!isLocked && (
            <>
              <NewAssessmentCard
                title="Add Evaluation"
                description="Create new feedback"
                onClick={() => setIsAddModalOpen(true)}
              />

              <ImportAssessmentCard
                title="Import Evaluation"
                description="Load feedback from JSON"
                onImport={handleImportJSON}
              />
            </>
          )}
          {/* Existing Evaluations */}
          {assessmentEvaluations.map((evalSession) => (
            <AssessmentEvaluationCard
              key={evalSession.id}
              evalSession={evalSession}
              assessmentId={assessmentId}
            />
          ))}
        </div>

        {/* Add Evaluation Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="New Evaluation"
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              You are about to start a new evaluation for{" "}
              <strong>{candidateName}</strong> as{" "}
              <strong>{assessorName || "Unknown Assessor"}</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvaluation}
                disabled={!assessorName}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Evaluation
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
