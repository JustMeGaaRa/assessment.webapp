import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { AssessorEvaluationPage } from "./pages/AssessorEvaluation";
import { AssessmentLibraryPage } from "./pages/AssessmentLibrary";
import { AssessmentSessionPage } from "./pages/AssessmentSession";
import { HomePage } from "./pages/Home";
import type {
  ModuleState,
  ProfileState,
  AssessorEvaluationState,
  AssessmentSessionState,
} from "./types";
import { createBackup, type BackupData } from "./utils/backupHelper";

const ASSESSMENT_LIBRARY_KEY = "assessment_matrix_data";
const ASSESSOR_EVALUATIONS_KEY = "assessment_evaluations";
const ASSESSMENT_SESSIONS_KEY = "assessment_groups";

const App = () => {
  // Master Data State with Persistence
  const [matrix, setMatrix] = useState<ModuleState[]>(() => {
    const saved = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
    return saved ? JSON.parse(saved).matrix : [];
  });

  const [profiles, setProfiles] = useState<ProfileState[]>(() => {
    const saved = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
    return saved ? JSON.parse(saved).profiles : [];
  });

  const [stacks, setStacks] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
    return saved ? JSON.parse(saved).stacks : {};
  });

  // Persist changes
  useEffect(() => {
    if (matrix.length > 0) {
      localStorage.setItem(
        ASSESSMENT_LIBRARY_KEY,
        JSON.stringify({ matrix, profiles, stacks }),
      );
    }
  }, [matrix, profiles, stacks]);

  // Assessment Groups State
  const [assessments, setAssessments] = useState<AssessmentSessionState[]>(
    () => {
      const saved = localStorage.getItem(ASSESSMENT_SESSIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    },
  );

  useEffect(() => {
    localStorage.setItem(ASSESSMENT_SESSIONS_KEY, JSON.stringify(assessments));
  }, [assessments]);

  // Assessment Evaluations State
  const [evaluations, setEvaluations] = useState<AssessorEvaluationState[]>(
    () => {
      const saved = localStorage.getItem(ASSESSOR_EVALUATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    },
  );

  useEffect(() => {
    localStorage.setItem(ASSESSOR_EVALUATIONS_KEY, JSON.stringify(evaluations));
  }, [evaluations]);

  // Assessor Name State
  const [assessorName, setAssessorName] = useState(() => {
    return localStorage.getItem("assessor_name") || "";
  });

  // Persist assessor name
  useEffect(() => {
    localStorage.setItem("assessor_name", assessorName);
  }, [assessorName]);

  const handleDataLoad = (
    m: ModuleState[],
    p: ProfileState[],
    s: Record<string, string>,
  ) => {
    setMatrix(m);
    setProfiles(p);
    setStacks(s);
    localStorage.setItem(
      ASSESSMENT_LIBRARY_KEY,
      JSON.stringify({ matrix: m, profiles: p, stacks: s }),
    );
  };

  const createAssessment = (assessment: AssessmentSessionState) => {
    setAssessments((prev) => {
      if (prev.some((a) => a.id === assessment.id)) {
        return prev.map((a) => (a.id === assessment.id ? assessment : a));
      }
      return [assessment, ...prev];
    });
  };

  const createEvaluation = (evaluation: AssessorEvaluationState) => {
    setEvaluations((prev) => {
      if (prev.some((e) => e.id === evaluation.id)) {
        return prev.map((e) => (e.id === evaluation.id ? evaluation : e));
      }
      return [evaluation, ...prev];
    });
  };

  const updateAssessment = (
    assessmentId: string,
    assessmentUpdate: Partial<AssessmentSessionState>,
  ) => {
    setAssessments((prev) =>
      prev.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, ...assessmentUpdate }
          : assessment,
      ),
    );
  };

  const updateEvaluation = (
    evaluationId: string,
    evaluationUpdate: Partial<AssessorEvaluationState>,
  ) => {
    setEvaluations((prev) =>
      prev.map((evaluation) =>
        evaluation.id === evaluationId
          ? { ...evaluation, ...evaluationUpdate }
          : evaluation,
      ),
    );
  };

  const backupApplicationState = () => {
    const backup = createBackup(
      { matrix, profiles, stacks },
      assessments,
      evaluations,
      assessorName,
    );
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreApplicationState = (data: BackupData) => {
    setMatrix(data.library.matrix);
    setProfiles(data.library.profiles);
    setStacks(data.library.stacks);
    setAssessments(data.assessments);
    setEvaluations(data.evaluations);
    setAssessorName(data.assessorName || "");
  };

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
        {/* ... */}
      </Routes>
    </BrowserRouter>
  );
};

const AssessmentSessionRoute = ({
  assessments,
  evaluations,
  onCreateAssessment,
  onCreateEvaluation,
  onUpdateAssessment,
  matrix,
  profiles,
  assessorName,
}: {
  assessments: AssessmentSessionState[];
  evaluations: AssessorEvaluationState[];
  onCreateAssessment: (assessment: AssessmentSessionState) => void;
  onCreateEvaluation: (evaluation: AssessorEvaluationState) => void;
  onUpdateAssessment: (
    id: string,
    data: Partial<AssessmentSessionState>,
  ) => void;
  matrix: ModuleState[];
  profiles: ProfileState[];
  stacks: Record<string, string>;
  assessorName: string;
}) => {
  const { assessmentId } = useParams();
  const assessment = assessments.find((a) => a.id === assessmentId);

  const profile = assessment
    ? profiles.find((p) => p.id === assessment.profileId)
    : undefined;

  const profileModules = profile
    ? matrix.filter((m) => profile.weights[m.id] > 0)
    : [];

  const assessmentEvaluations = evaluations.filter(
    (evaluation) => evaluation.assessmentId === assessmentId,
  );

  return (
    <AssessmentSessionPage
      assessment={assessment}
      evaluations={assessmentEvaluations}
      onCreateAssessment={onCreateAssessment}
      onCreateEvaluation={onCreateEvaluation}
      onUpdateAssessment={onUpdateAssessment}
      matrix={profileModules}
      profile={profile}
      assessorName={assessorName}
    />
  );
};

const AssessmentEvaluationRoute = ({
  evaluations,
  matrix,
  profiles,
  onUpdateEvaluation,
  onCreateEvaluation,
  assessorName,
}: {
  evaluations: AssessorEvaluationState[];
  matrix: ModuleState[];
  profiles: ProfileState[];
  onUpdateEvaluation: (
    id: string,
    data: Partial<AssessorEvaluationState>,
  ) => void;
  onCreateEvaluation: (evaluation: AssessorEvaluationState) => void;
  assessorName: string;
}) => {
  const { evaluationId } = useParams();
  const evaluation = evaluations.find((s) => s.id === evaluationId);

  const { sendUpdateEvaluation } = usePeerSession({
    sessionId: evaluation?.assessmentId || "",
    currentEvaluations: evaluations,
    onSyncReceived: (
      _syncAssessment: AssessmentSessionState,
      syncEvaluations: AssessorEvaluationState[],
    ) => {
      // Upsert synced evaluations
      syncEvaluations.forEach((ev) => onCreateEvaluation(ev));
    },
    onEvaluationReceived: (ev: AssessorEvaluationState) => {
      onCreateEvaluation(ev);
    },
    onAssessmentUpdateReceived: () => {
      // Do nothing for assessment props updates here
    },
    assessorName,
  });

  if (!evaluation) {
    return <Navigate to="/" replace />;
  }

  const profile = profiles.find((p) => p.id === evaluation.profileId);

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const profileModules = matrix.filter((m) => profile.weights[m.id] > 0);

  return (
    <AssessorEvaluationPage
      evaluation={evaluation}
      modules={profileModules}
      profile={profile}
      onUpdate={(data) => {
        onUpdateEvaluation(evaluation.id, data);
        sendUpdateEvaluation({ ...evaluation, ...data });
      }}
    />
  );
};

export default App;
