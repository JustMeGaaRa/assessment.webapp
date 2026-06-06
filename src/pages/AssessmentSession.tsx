import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Upload,
  User,
  Link as LinkIcon,
  AlertTriangle,
  Check,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Modal } from "../components/ui/Modal";
import type {
  AssessmentSessionState,
  AssessorEvaluationState,
  ModuleState,
  ProfileState,
  LevelMapping,
  AssessmentStatistics,
} from "../types";
import { importSessionFromJSON } from "../utils/fileHelpers";
import { ActionCard } from "../components/dashboard/ActionCard";
import { AssessmentEvaluationCard } from "../components/dashboard/AssessmentEvaluationCard";
import { AssessmentSummaryCard } from "../components/assessment/AssessmentSummaryCard";
import { AssessmentFeedback, type AssessmentFeedbackProps } from "../components/assessment/AssessmentFeedback";
import { EvaluationStateHelper } from "../utils/evaluationStateHelper";
import { AssessmentHelper } from "../utils/assessmentHelper";
import type { PeerSessionState } from "../hooks/usePeerSession";
import { SessionConnectionBar } from "../components/assessment/SessionConnectionBar";

interface AssessmentSessionPageProps {
  assessment?: AssessmentSessionState;
  evaluations: AssessorEvaluationState[];
  matrix: ModuleState[];
  profile?: ProfileState;
  assessorName: string;

  // Session Props
  sessionStatus: PeerSessionState["status"];
  sessionError: string | null;
  activePeers: { id: string; name: string }[];
  isHost: boolean;
  hostPeerId?: string; // The ID to share (if Host) or the ID to join (if Guest)

  levelMappings?: LevelMapping[];
  onCreateAssessment: (assessment: AssessmentSessionState) => void;
  onCreateEvaluation: (session: AssessorEvaluationState) => void;
  onUpdateAssessment: (
    id: string,
    data: Partial<AssessmentSessionState>,
  ) => void;
  onStartSession: () => void;
  onEndSession: () => void;
  onJoinSession: () => void;
  onLeaveSession: () => void;
}

export const AssessmentSessionPage = ({
  assessment,
  evaluations,
  assessorName,
  matrix,
  profile,
  levelMappings,
  activePeers,
  sessionStatus,
  sessionError,
  isHost,
  hostPeerId,
  onCreateEvaluation,
  onStartSession,
  onEndSession,
  onJoinSession,
  onLeaveSession,
}: AssessmentSessionPageProps) => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  // Loading State for Guest (If no assessment data yet)
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

          {sessionStatus === "error" && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 text-left">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{sessionError || "Failed to connect."}</span>
            </div>
          )}

          {sessionStatus === "connected" ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 py-2 px-4 rounded-full mx-auto w-fit">
              <Check size={18} /> Connected! Syncing...
            </div>
          ) : sessionStatus === "connecting" ? (
            <div className="text-slate-400 text-sm">
              Establishing P2P connection...
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

  // Peer details managed in SessionConnectionBar

  const assessors = evaluations.map((ev, idx) => {
    const style = colors[idx % colors.length];
    return {
      id: ev.id,
      name: ev.assessorName || `Assessor ${idx + 1}`,
      color: style.color,
      text: style.text,
      light: style.light,
      isCurrentUser: false, // We don't distinguish explicitly here unless we match assessorName? But names aren't unique IDs.
    };
  });

  const assessmentSummary =
    EvaluationStateHelper.mapEvaluationStateToAssessmentFeedback(
      assessment,
      evaluations,
      matrix,
    );
  const assessmentRestructured = AssessmentHelper.changeAssessmentStructure(
    matrix,
    profile,
    assessmentSummary,
  );
  const assessmentStatistics = AssessmentHelper.calculateAssessmentStatistics(
    profile,
    matrix,
    levelMappings,
    assessmentRestructured,
  );

  const aggregateNotes = (modules: ModuleState[], stats: AssessmentStatistics) => {
    return Object.entries(stats.moduleStatistics).reduce((acc, [moduleId, stats]) => {
      const moduleNotes = {
        module: modules.find(m => m.id === moduleId)?.title ?? "Unknown module",
        notes: Object.entries(stats.assessorNotes ?? {})
        .filter(([, notes]) => notes.length > 0)
        .map(([, notes]) => notes.filter((note) => note !== "" && note !== undefined).join(". "))
      }
      return [...acc, moduleNotes];
    }, [] as Array<{module: string, notes: string[]}>)
  }

  const assessmentDetails: AssessmentFeedbackProps = {
    assessmentId: assessment.id,
    assessmentDate: assessment.date,
    candidateName: assessment.candidateName,
    profileName: assessment.profileTitle,
    technologyStack: assessment.stack,
    summaryScore: assessmentStatistics.totalScore,
    proficiencyLevel: assessmentStatistics.proficiencyLevel,
    assessmentNotes: aggregateNotes(matrix, assessmentStatistics)
  }

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
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <SessionConnectionBar
              assessmentId={assessmentId}
              assessorName={assessorName}
              activePeers={activePeers}
              sessionStatus={sessionStatus}
              sessionError={sessionError}
              isHost={isHost}
              hostPeerId={hostPeerId}
              onStartSession={onStartSession}
              onEndSession={onEndSession}
              onJoinSession={onJoinSession}
              onLeaveSession={onLeaveSession}
            />
          </div>
        </div>

        <PageHeader
          icon={<User className="text-indigo-600 w-8 h-8" />}
          title="Assessment Session"
          description={
            assessment
              ? `Assess ${candidateName}`
              : "An overview of the assessment session"
          }
        />

        {/* Assessment Summary Section */}
        {evaluations.length > 0 && (
          <div className="grid grid-cols-1 gap-10 mb-10">
            <AssessmentSummaryCard
              key={assessment.id}
              assessors={assessors}
              matrix={matrix}
              assessment={assessmentSummary}
              statistics={assessmentStatistics}
            />

            <AssessmentFeedback
              {...assessmentDetails}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ActionCard
            icon={<Plus size={24} />}
            title="Add Evaluation"
            description="Create new feedback"
            onClick={() => setIsAddModalOpen(true)}
          />

          <ActionCard
            icon={<Upload size={24} />}
            title="Import Evaluation"
            description="Load feedback from JSON"
            variant="emerald"
            fileInput={{
              id: "import-eval-input",
              accept: ".json",
              onChange: handleImportJSON,
            }}
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
              <strong>{assessment.candidateName}</strong> as{" "}
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
