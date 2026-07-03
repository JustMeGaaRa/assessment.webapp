import { useState, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Upload,
  User,
  Link as LinkIcon,
  AlertTriangle,
  Check,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import {
  CompetenceMatrix,
  ConsolidatedAssessmentSummary,
  IndividualAssessmentScore,
  ProficiencyLevel,
  Profile,
  AssessmentSession,
} from "@lib/matrix/types";
import { importSessionFromJSON } from "../utils/fileHelpers";
import { ActionCard } from "../components/dashboard/ActionCard";
import { AssessmentEvaluationCard } from "../components/dashboard/AssessmentEvaluationCard";
import { AssessmentSummaryCard } from "../components/assessment/AssessmentSummaryCard";
import {
  AssessmentFeedback,
  type AssessmentFeedbackProps,
} from "../components/assessment/AssessmentFeedback";
import { calculateAssessmentStatistics } from "@lib/matrix";
import type { PeerSessionState } from "@/hooks/usePeerSession";
import { SessionConnectionBar } from "@/components/assessment/SessionConnectionBar";
import { dummySkillScores } from "@/components/library/skillScoresData";
import { getApplicationState } from "@lib/state/v2/mappers";
import { AppDataStateV1 } from "@/lib/state/v1";

interface AssessmentSessionPageProps {
  assessment?: AssessmentSession;
  evaluations: IndividualAssessmentScore[];
  matrix: CompetenceMatrix;
  profile?: Profile;
  assessorName: string;

  // Session Props
  sessionStatus: PeerSessionState["status"];
  sessionError: string | null;
  activePeers: { id: string; name: string }[];
  isHost: boolean;
  hostPeerId?: string;

  levelMappings?: ProficiencyLevel[];
  onCreateAssessment: (assessment: AssessmentSession) => void;
  onCreateEvaluation: (session: IndividualAssessmentScore) => void;
  onUpdateAssessment: (
    id: string,
    data: Partial<AssessmentSession>,
  ) => void;
  onDeleteEvaluation?: (evaluationId: string) => void;
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
  onDeleteEvaluation,
  onStartSession,
  onEndSession,
  onJoinSession,
  onLeaveSession,
}: AssessmentSessionPageProps) => {
  const params = useParams();
  const assessmentId = params?.assessmentId as string;
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [evaluationType, setEvaluationType] = useState<"expert" | "self">("expert");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTranscriptText(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleRunAiEvaluation = async () => {
    if (!transcriptText.trim()) {
      setEvaluationError("Please provide a transcript first.");
      return;
    }

    if (!assessment || !profile) {
      setEvaluationError("No assessment or profile context found.");
      return;
    }

    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const selectedStack = matrix.stacks.find((s) => s.stackName === assessment.details.stack);
      if (!selectedStack) {
        throw new Error(`Tech stack "${assessment.details.stack}" not found in matrix.`);
      }

      const response = await fetch("/api/assessment/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcriptText,
          technologyStack: selectedStack,
          skills: dummySkillScores,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate assessment transcript.");
      }

      const data = await response.json();
      if (!data.summary || !data.summary.topics) {
        throw new Error("Invalid response structure from evaluation agent.");
      }

      const aiTopics = data.summary.topics as Array<{
        name: string;
        score: number;
        reasoning: string;
        notes: string;
      }>;

      const individualAssessmentScore: IndividualAssessmentScore = {
        feedbackId: crypto.randomUUID(),
        type: "llm",
        assessor: {
          fullname: "Google Gemini",
        },
        status: "completed",
        date: new Date(),
        modules: matrix.modules.map((m) => ({
          moduleId: m.moduleId,
          moduleName: m.moduleName,
          topics: m.topics.map((t) => {
            const found = aiTopics.find((at) => at.name.toLowerCase() === t.topicName.toLowerCase());
            return {
              topicId: t.topicId,
              topicName: t.topicName,
              score: found?.score ?? 0,
              reasoning: found?.reasoning,
              notes: found?.notes ?? "",
            };
          }),
        })),
      };

      onCreateEvaluation(individualAssessmentScore);
      setTranscriptText("");
      setIsAiModalOpen(false);
      alert("AI Evaluation completed and added successfully!");
    } catch (err: unknown) {
      console.error(err);
      if (
        typeof err === "object" &&
        err &&
        "message" in err &&
        typeof err.message === "string"
      ) {
        setEvaluationError(
          err.message || "An unexpected error occurred during evaluation.",
        );
      } else {
        setEvaluationError("An unexpected error occurred during evaluation.");
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const candidateName = assessment?.details.candidate.fullname || "Unknown Candidate";
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
            onClick={() => router.push("/")}
            className="text-indigo-600 font-bold hover:underline mt-4 block"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasExistingEvaluation = evaluations.some(
    (ev) =>
      ev.assessor.fullname &&
      assessorName &&
      ev.assessor.fullname.trim().toLowerCase() === assessorName.trim().toLowerCase()
  );

  const assessors = evaluations
    .map((ev, idx) => {
      const style = colors[idx % colors.length];
      return {
        name: ev.assessor.fullname || `Assessor ${idx + 1}`,
        color: style.color,
        text: style.text,
        light: style.light,
        isCurrentUser: false,
      };
    });

  const assessmentStatistics = calculateAssessmentStatistics(
    profile,
    matrix,
    levelMappings,
    assessment,
  );

  const consolidatedAssessmentSummary: ConsolidatedAssessmentSummary = {
    assessmentId: assessment.assessmentId,
    details: assessment.details,
    modules: matrix.modules.map((module) => ({
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      weightedScore:
        assessmentStatistics.modules.find((x) => x.moduleId === module.moduleId)
          ?.stats?.weightedScore ?? 0,
      weight:
        assessmentStatistics.modules.find((x) => x.moduleId === module.moduleId)
          ?.stats?.weight ?? 0,
      notes:
        assessmentStatistics.modules.find((x) => x.moduleId === module.moduleId)
          ?.notes ?? [],
    })),
    summary: {
      proficiencyLevel: assessmentStatistics.summary.proficiencyLevel ?? "",
      totalScore: assessmentStatistics.summary.totalScore,
    },
  };

  const assessmentDetails: AssessmentFeedbackProps = {
    summary: consolidatedAssessmentSummary,
  };

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
    const newEvaluation: IndividualAssessmentScore = {
      feedbackId: newEvaluationId,
      type: evaluationType,
      assessor: {
        fullname: assessorName,
      },
      status: "ongoing",
      modules: matrix.modules.map((m) => ({
        moduleId: m.moduleId,
        moduleName: m.moduleName,
        topics: m.topics.map((t) => ({
          topicId: t.topicId,
          topicName: t.topicName,
          score: 0,
          notes: "",
        })),
      })),
      date: new Date(),
    };

    onCreateEvaluation(newEvaluation);
    setIsAddModalOpen(false);
    router.push(`/assessment/${assessmentId}/evaluation/${newEvaluationId}`);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importSessionFromJSON(file)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((imported: any) => {
        let finalFeedback: IndividualAssessmentScore;
        if (imported.feedbackId) {
          finalFeedback = {
            ...imported,
            date: imported.date ? new Date(imported.date) : new Date(),
          };
        } else {
          // Version 1 format: map to V2
          const appStateV1: AppDataStateV1 = {
            version: 1,
            timestamp: new Date(),
            library: {
              matrix: matrix.modules.map((m) => ({
                id: m.moduleId,
                title: m.moduleName,
                description: m.description || "",
                topics: m.topics.map((t) => ({
                  id: t.topicId,
                  name: t.topicName,
                  weight: 1,
                  mappings: {},
                })),
              })),
              profiles: [],
              stacks: [],
            },
            assessments: [
              {
                id: assessmentId,
                candidateName: assessment.details.candidate.fullname,
                profileId: assessment.details.profile.profileId,
                profileTitle: assessment.details.profile.title,
                stack: assessment.details.stack,
                date: assessment.details.date.toISOString(),
              }
            ],
            evaluations: [imported],
          };
          const appStateV2 = getApplicationState(appStateV1);
          finalFeedback = appStateV2.assessments[0]?.feedbacks[0] || {
            feedbackId: crypto.randomUUID(),
            type: "expert",
            assessor: { fullname: imported.assessorName || "Anonymous" },
            modules: [],
          };
        }

        onCreateEvaluation(finalFeedback);
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
              onClick={() => router.push("/")}
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
              key={assessment.assessmentId}
              assessors={assessors}
              matrix={matrix}
              assessment={assessment}
              statistics={assessmentStatistics}
            />

            <AssessmentFeedback {...assessmentDetails} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ActionCard
            icon={<Plus size={24} />}
            title="Add Evaluation"
            description={
              hasExistingEvaluation
                ? "You have already added an evaluation"
                : "Create new feedback"
            }
            disabled={hasExistingEvaluation}
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

          <ActionCard
            icon={<Sparkles size={24} />}
            title="AI Evaluation"
            description="Evaluate from transcript"
            variant="indigo"
            onClick={() => setIsAiModalOpen(true)}
          />
          {/* Existing Evaluations */}
          {evaluations.map((evalSession) => (
            <AssessmentEvaluationCard
              key={evalSession.feedbackId}
              evalSession={evalSession}
              assessmentId={assessmentId}
              profile={profile}
              onDelete={onDeleteEvaluation}
            />
          ))}
        </div>

        {/* Add Evaluation Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEvaluationType("expert");
          }}
          title="New Evaluation"
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              You are about to start a new evaluation for{" "}
              <strong>{candidateName}</strong> as{" "}
              <strong>{assessorName || "Unknown Assessor"}</strong>.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider">
                Evaluation Type
              </label>
              <select
                value={evaluationType}
                onChange={(e) => setEvaluationType(e.target.value as "expert" | "self")}
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-sans text-sm text-slate-700"
              >
                <option value="expert">Expert Evaluation</option>
                <option value="self">Self Evaluation</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEvaluationType("expert");
                }}
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

        {/* AI Evaluation Modal */}
        <Modal
          isOpen={isAiModalOpen}
          onClose={() => {
            if (!isEvaluating) {
              setIsAiModalOpen(false);
              setTranscriptText("");
              setEvaluationError(null);
            }
          }}
          title="AI Evaluation"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Provide the discussion transcript of the assessment below. Gemini
              will evaluate the candidate's skills based on the active
              competency matrix.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider">
                Transcript Content
              </label>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                disabled={isEvaluating}
                placeholder="Paste discussion transcript here..."
                className="w-full h-48 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Upload size={18} />
                <span>Upload transcript file (.txt, .md)</span>
              </div>
              <label className="relative cursor-pointer bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                Choose File
                <input
                  type="file"
                  accept=".txt,.md"
                  disabled={isEvaluating}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {transcriptText.trim().length > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 p-2 rounded-lg">
                <span>
                  Transcript length: <strong>{transcriptText.length}</strong>{" "}
                  characters
                </span>
                <button
                  type="button"
                  onClick={() => setTranscriptText("")}
                  disabled={isEvaluating}
                  className="text-red-500 hover:text-red-600 hover:underline font-semibold"
                >
                  Clear
                </button>
              </div>
            )}

            {evaluationError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{evaluationError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAiModalOpen(false);
                  setTranscriptText("");
                  setEvaluationError(null);
                }}
                disabled={isEvaluating}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunAiEvaluation}
                disabled={isEvaluating || !transcriptText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="animate-spin" size={16} />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Run AI Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
