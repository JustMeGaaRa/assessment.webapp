import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useApplicationData } from "./hooks/useApplicationData";
import { usePeerSession, type PeerSessionState } from "./hooks/usePeerSession";
import { AssessmentLibraryPage } from "./pages/AssessmentLibrary";
import { HomePage } from "./pages/Home";
import { AssessmentEvaluationRoute } from "./routes/AssessmentEvaluationRoute";
import { AssessmentSessionRoute } from "./routes/AssessmentSessionRoute";
import type { AssessmentSessionState, AssessorEvaluationState } from "./types";

const App = () => {
  const {
    matrix,
    profiles,
    stacks,
    assessments,
    evaluations,
    assessorName,
    setAssessorName,
    handleDataLoad,
    createAssessment,
    createEvaluation,
    updateAssessment,
    updateEvaluation,
    backupApplicationState,
    restoreApplicationState,
  } = useApplicationData();

  const [hostedSessionId, setHostedSessionId] = useState<string | null>(null);

  // Host Session Hook (Persists across navigation)
  const hostSession: PeerSessionState = usePeerSession({
    sessionId: hostedSessionId || "",
    assessorName,
    currentAssessment: assessments.find((a) => a.id === hostedSessionId),
    currentEvaluations: evaluations.filter(
      (e) => e.assessmentId === hostedSessionId,
    ),
    onSyncReceived: (
      _a: AssessmentSessionState,
      evs: AssessorEvaluationState[],
    ) => {
      evs.forEach((ev) => createEvaluation(ev));
    },
    onEvaluationReceived: (ev: AssessorEvaluationState) => createEvaluation(ev),
    onAssessmentUpdateReceived: (update: Partial<AssessmentSessionState>) => {
      if (hostedSessionId) updateAssessment(hostedSessionId, update);
    },
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              assessments={assessments}
              evaluations={evaluations}
              onCreateAssessment={createAssessment}
              onCreateSession={createEvaluation}
              onDataLoad={handleDataLoad}
              existingStacks={Object.values(stacks)}
              existingProfiles={profiles}
              hasData={
                matrix.length > 0 &&
                assessorName !== "" &&
                assessorName !== undefined
              }
              assessorName={assessorName}
              setAssessorName={setAssessorName}
              onRestore={restoreApplicationState}
              onBackup={backupApplicationState}
              hostedSessionId={hostedSessionId}
            />
          }
        />
        <Route
          path="/assessment/:assessmentId/evaluation/:evaluationId"
          element={
            <AssessmentEvaluationRoute
              evaluations={evaluations}
              matrix={matrix}
              profiles={profiles}
              onUpdateEvaluation={updateEvaluation}
              onCreateEvaluation={createEvaluation}
              assessorName={assessorName}
            />
          }
        />
        <Route
          path="/assessment/:assessmentId"
          element={
            <AssessmentSessionRoute
              assessments={assessments}
              evaluations={evaluations}
              onCreateAssessment={createAssessment}
              onCreateEvaluation={createEvaluation}
              onUpdateAssessment={updateAssessment}
              matrix={matrix}
              profiles={profiles}
              stacks={stacks}
              assessorName={assessorName}
              hostedSessionId={hostedSessionId}
              setHostedSessionId={setHostedSessionId}
              hostSession={hostSession}
            />
          }
        />
        <Route
          path="/library"
          element={
            <AssessmentLibraryPage
              matrix={matrix}
              profiles={profiles}
              stacks={stacks}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
