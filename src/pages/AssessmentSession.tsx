import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Plus, Unlock, Upload, User } from "lucide-react";
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

interface AssessmentSessionPageProps {
  assessment: AssessmentSessionState;
  evaluations: AssessorEvaluationState[];
  onCreateSession: (session: AssessorEvaluationState) => void;
  onUpdateAssessment: (
    id: string,
    data: Partial<AssessmentSessionState>,
  ) => void;
  onUpdateSession: (id: string, data: Partial<AssessorEvaluationState>) => void;
  matrix: ModuleState[];
  profile: ProfileState;
  assessorName: string;
  levelMappings?: LevelMapping[];
}

export const AssessmentSessionPage = ({
  assessment,
  evaluations,
  onCreateSession,
  onUpdateAssessment,
  assessorName,
  matrix,
  profile,
  levelMappings,
}: AssessmentSessionPageProps) => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

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
    const newSession: AssessorEvaluationState = {
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
          {!isLocked && (
            <>
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
