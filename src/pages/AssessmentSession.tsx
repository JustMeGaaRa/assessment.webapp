import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Lock,
  Unlock,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Modal } from "../components/ui/Modal";
import type {
  AssessmentScores,
  AssessmentSessionState,
  AssessorEvaluationState,
  ModuleState,
  ProfileState,
} from "../types";
import { importSessionFromJSON } from "../utils/fileHelpers";
import { NewAssessmentCard } from "../components/dashboard/NewAssessmentCard";
import { ImportAssessmentCard } from "../components/dashboard/ImportAssessmentCard";
import { AssessmentEvaluationCard } from "../components/dashboard/AssessmentEvaluationCard";
import { AssessmentSummaryCard } from "../components/assessment/AssessmentSummaryCard";
import { EvaluationStateHelper } from "../utils/evaluationStateHelper";
import { AvatarGroup } from "../components/ui/AvatarGroup";
import { usePeerSession } from "../hooks/usePeerSession";

interface AssessmentSessionPageProps {
  assessment?: AssessmentSessionState;
  evaluations: AssessorEvaluationState[];
  onCreateAssessment: (assessment: AssessmentSessionState) => void;
  onCreateEvaluation: (session: AssessorEvaluationState) => void;
  onUpdateAssessment: (
    id: string,
    data: Partial<AssessmentSessionState>,
  ) => void;
  matrix: ModuleState[];
  profile?: ProfileState;
  assessorName: string;
}

export const AssessmentSessionPage = ({
  assessment,
  evaluations,
  onCreateAssessment,
  onCreateEvaluation,
  onUpdateAssessment,
  assessorName,
  matrix,
  profile,
}: AssessmentSessionPageProps) => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/assessment/${assessmentId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { peerId, isConnected, sendUpdateEvaluation, sendUpdateAssessment } =
    usePeerSession({
      sessionId: assessmentId || "",
      assessorName,
      currentAssessment: assessment,
      currentEvaluations: evaluations,
      onSyncReceived: (syncedAssessment, syncedEvaluations) => {
        // Update assessment if ID matches or if we are initializing
        if (syncedAssessment) {
          if (assessment === undefined) {
            onCreateAssessment(syncedAssessment);
          } else if (syncedAssessment.id === assessment.id) {
            onUpdateAssessment(syncedAssessment.id, syncedAssessment);
          }
        }
        // Update evaluations
        syncedEvaluations.forEach((ev) => {
          onCreateEvaluation(ev);
        });
      },
      onEvaluationReceived: (evaluation) => {
        onCreateEvaluation(evaluation);
      },
      onAssessmentUpdateReceived: (update) => {
        if (assessment) {
          onUpdateAssessment(assessment.id, update);
        }
      },
    });

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

  // Loading State for Guest
  if (!assessment || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <LinkIcon size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Joining Session...
          </h2>
          <p className="text-slate-500">
            Connecting to peer to synchronize assessment data.
          </p>
          {isConnected ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 py-2 px-4 rounded-full mx-auto w-fit">
              <Check size={18} /> Connected! Syncing...
            </div>
          ) : (
            <div className="text-slate-400 text-sm">
              Waiting for connection...
            </div>
          )}
          <button
            onClick={() => navigate("/")}
            className="text-indigo-600 font-bold hover:underline mt-4 block"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const assessors = evaluations.map((ev, idx) => {
    const style = colors[idx % colors.length];
    return {
      id: ev.id,
      name: ev.assessorName || `Assessor ${idx + 1}`,
      color: style.color,
      text: style.text,
      light: style.light,
    };
  });

  const assessmentProps: AssessmentScores =
    EvaluationStateHelper.mapEvaluationStateToAssessmentFeedback(
      assessment.id,
      evaluations,
      matrix,
    );

  const handleToggleLock = () => {
    if (!assessment) return;
    const newLockState = !isLocked;
    const confirmMsg = newLockState
      ? "Are you sure you want to LOCK this assessment session? No further evaluations can be added."
      : "Are you sure you want to UNLOCK this assessment session?";

    if (window.confirm(confirmMsg)) {
      onUpdateAssessment(assessment.id, { locked: newLockState });
      sendUpdateAssessment({ locked: newLockState });
    }
  };

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
    const newEvaluation: AssessorEvaluationState = {
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

    onCreateEvaluation(newEvaluation);
    sendUpdateEvaluation(newEvaluation);
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
        const newSession: AssessorEvaluationState = {
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
        onCreateEvaluation(newSession);
        sendUpdateEvaluation(newSession);
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

          <div className="flex flex-wrap items-center gap-4">
            <AvatarGroup users={assessors} />

            {assessment && (
              <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
            )}

            <button
              onClick={handleCopyLink}
              disabled={!peerId}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl font-bold transition-all shadow-sm text-sm"
              title="Copy Session Link"
            >
              {copied ? <Check size={18} /> : <LinkIcon size={18} />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>

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
        {evaluations.length > 0 && (
          <div className="grid grid-cols-1 gap-10 mb-10">
            <AssessmentSummaryCard
              key={assessment.id}
              candidate={candidateName}
              stack={assessment.stack}
              date={new Date(assessment.date)}
              assessors={assessors}
              assessment={assessmentProps}
              profile={profile}
              matrix={matrix}
            />
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
          {evaluations.map((evalSession) => (
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
