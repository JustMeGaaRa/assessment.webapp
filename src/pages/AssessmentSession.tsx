import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Link as LinkIcon,
  Check,
  Play,
  Square,
  Share2,
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
  isOnline: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
  activePeers: { id: string; name: string }[];
  isConnected: boolean;
}

export const AssessmentSessionPage = ({
  assessment,
  evaluations,
  onCreateEvaluation,
  assessorName,
  matrix,
  profile,
  activePeers,
  isConnected,
  isOnline,
  onStartSession,
  onEndSession,
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

  const candidateName = assessment?.candidateName || "Unknown Candidate";
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

  const onlineUsers = [{ name: assessorName, id: "me" }, ...activePeers].map(
    (p, idx) => {
      const style = colors[idx % colors.length];
      return {
        id: p.id,
        name: p.name,
        color: style.color,
        text: style.text,
        light: style.light,
      };
    },
  );

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

  const handleAddEvaluation = (e: React.FormEvent) => {
    e.preventDefault();

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
    // sendUpdateEvaluation(newEvaluation); // P2P handled by wrapper
    setIsAddModalOpen(false);
    navigate(`/assessment/${assessmentId}/evaluation/${newEvaluationId}`);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        // sendUpdateEvaluation(newSession); // P2P handled by wrapper
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
            <AvatarGroup users={onlineUsers} />

            {assessment && (
              <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
            )}

            {!isOnline && !isConnected ? (
              <button
                onClick={onStartSession}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-sm text-sm"
              >
                <Play size={18} />
                <span>Start Session</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onEndSession}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:border-red-300 hover:text-red-600 rounded-xl font-bold transition-all shadow-sm text-sm"
                >
                  <Square size={18} />
                  <span>End Session</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl font-bold transition-all shadow-sm text-sm"
                >
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                  <span>{copied ? "Copied" : "Share Session"}</span>
                </button>
              </>
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
