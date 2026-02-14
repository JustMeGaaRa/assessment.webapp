import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useApplicationData } from "./hooks/useApplicationData";
import { usePeerSession, type PeerSessionState } from "./hooks/usePeerSession";
import { AssessmentLibraryPage } from "./pages/AssessmentLibrary";
import { HomePage } from "./pages/Home";
import { AssessmentEvaluationRoute } from "./routes/AssessmentEvaluationRoute";
import { AssessmentSessionRoute } from "./routes/AssessmentSessionRoute";
import type {
  ModuleState,
  ProfileState,
  AssessorEvaluationState,
  AssessmentSessionState,
} from "./types";

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
  const [guestHostId, setGuestHostId] = useState<string | null>(null);
  const [guestAssessmentId, setGuestAssessmentId] = useState<string | null>(
    null,
  );

  // Host Session Hook (Persists across navigation)
  const hostSession: PeerSessionState = usePeerSession({
    assessorName,
    currentAssessment: assessments.find((a) => a.id === hostedSessionId),
    currentEvaluations: evaluations.filter(
      (e) => e.assessmentId === hostedSessionId,
    ),
    currentMatrix: matrix,
    currentProfiles: profiles,
    currentStacks: stacks,
    onSyncReceived: (
      _a: AssessmentSessionState,
      evaluations: AssessorEvaluationState[],
    ) => {
      evaluations.forEach((ev) => createEvaluation(ev));
    },
    onEvaluationReceived: (ev: AssessorEvaluationState) => createEvaluation(ev),
    onAssessmentUpdateReceived: (update: Partial<AssessmentSessionState>) => {
      if (hostedSessionId) updateAssessment(hostedSessionId, update);
    },
    onSessionClosed: () => {
      setHostedSessionId(null);
    },
  });

  // Guest Session Hook (Persists across navigation)
  const guestSession: PeerSessionState = usePeerSession({
    assessorName,
    onSyncReceived: (
      syncedAssessment: AssessmentSessionState,
      syncedEvaluations: AssessorEvaluationState[],
      syncedMatrix: ModuleState[],
      syncedProfiles: ProfileState[],
      syncedStacks: Record<string, string>,
    ) => {
      if (syncedAssessment) {
        createAssessment(syncedAssessment);
        // If we receive sync, we assume we are connected to this assessment
        setGuestAssessmentId(syncedAssessment.id);
      }
      if (syncedMatrix && syncedProfiles && syncedStacks) {
        // Update library data if provided
        handleDataLoad(syncedMatrix, syncedProfiles, syncedStacks);
      }
      syncedEvaluations.forEach((ev) => createEvaluation(ev));
    },
    onEvaluationReceived: (ev: AssessorEvaluationState) => createEvaluation(ev),
    onAssessmentUpdateReceived: (update: Partial<AssessmentSessionState>) => {
      if (update.id) {
        updateAssessment(update.id, update);
      }
    },
    onSessionClosed: () => {
      setGuestHostId(null);
      setGuestAssessmentId(null);
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
              guestAssessmentId={guestAssessmentId}
              guestHostId={guestHostId}
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
              assessorName={assessorName}
              activeSession={
                hostedSessionId
                  ? hostSession
                  : guestHostId
                    ? guestSession
                    : undefined
              }
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
              assessorName={assessorName}
              hostedSessionId={hostedSessionId}
              setHostedSessionId={setHostedSessionId}
              hostSession={hostSession}
              guestHostId={guestHostId}
              setGuestHostId={setGuestHostId}
              guestSession={guestSession}
              setGuestAssessmentId={setGuestAssessmentId}
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
