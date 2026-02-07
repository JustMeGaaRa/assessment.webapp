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
  LevelMapping, // Added
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

  const [levelMappings, setLevelMappings] = useState<LevelMapping[]>(() => {
    const saved = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
    return saved ? JSON.parse(saved).levelMappings || [] : [];
  });

  // Persist changes
  useEffect(() => {
    if (matrix.length > 0) {
      localStorage.setItem(
        ASSESSMENT_LIBRARY_KEY,
        JSON.stringify({ matrix, profiles, stacks, levelMappings }),
      );
    }
  }, [matrix, profiles, stacks, levelMappings]);

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
    l?: LevelMapping[],
  ) => {
    setMatrix(m);
    setProfiles(p);
    setStacks(s);
    if (l) setLevelMappings(l);
    localStorage.setItem(
      ASSESSMENT_LIBRARY_KEY,
      JSON.stringify({ matrix: m, profiles: p, stacks: s, levelMappings: l || levelMappings }),
    );
  };

  const createAssessment = (assessment: AssessmentSessionState) => {
    setAssessments((prev) => [assessment, ...prev]);
  };

  const createEvaluation = (evaluation: AssessorEvaluationState) => {
    setEvaluations((prev) => [evaluation, ...prev]);
  };

  const updateAssessment = (
    id: string,
    data: Partial<AssessmentSessionState>,
  ) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a)),
    );
  };

  const updateEvaluation = (
    id: string,
    data: Partial<AssessorEvaluationState>,
  ) => {
    setEvaluations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
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
    if (data.library.levelMappings) setLevelMappings(data.library.levelMappings);
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
              updateSession={updateEvaluation}
            />
          }
        />
        <Route
          path="/assessment/:assessmentId"
          element={
            <AssessmentSessionRoute
              assessments={assessments}
              evaluations={evaluations}
              onCreateSession={createEvaluation}
              onUpdateAssessment={updateAssessment}
              matrix={matrix}
              profiles={profiles}
              assessorName={assessorName}
              onUpdateSession={updateEvaluation}
              levelMappings={levelMappings}
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
              levelMappings={levelMappings}
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
  onCreateSession,
  onUpdateAssessment,
  onUpdateSession,
  matrix,
  profiles,
  assessorName,
  levelMappings,
}: {
  assessments: AssessmentSessionState[];
  evaluations: AssessorEvaluationState[];
  onCreateSession: (session: AssessorEvaluationState) => void;
  onUpdateAssessment: (
    id: string,
    data: Partial<AssessmentSessionState>,
  ) => void;
  onUpdateSession: (id: string, data: Partial<AssessorEvaluationState>) => void;
  matrix: ModuleState[];
  profiles: ProfileState[];
  assessorName: string;
  levelMappings: LevelMapping[];
}) => {
  const { assessmentId } = useParams();
  const assessment = assessments.find((a) => a.id === assessmentId);

  if (!assessment) {
    return <Navigate to="/" replace />;
  }

  const profile = profiles.find((p) => p.id === assessment.profileId);

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const profileModules = matrix.filter((m) => profile.weights[m.id] > 0);
  const assessmentEvaluations = evaluations.filter(
    (evaluation) => evaluation.assessmentId === assessmentId,
  );

  return (
    <AssessmentSessionPage
      assessment={assessment}
      evaluations={assessmentEvaluations}
      onCreateSession={onCreateSession}
      onUpdateAssessment={onUpdateAssessment}
      onUpdateSession={onUpdateSession}
      matrix={profileModules}
      profile={profile}
      assessorName={assessorName}
      levelMappings={levelMappings}
    />
  );
};

const AssessmentEvaluationRoute = ({
  evaluations,
  matrix,
  profiles,
  updateSession,
}: {
  evaluations: AssessorEvaluationState[];
  matrix: ModuleState[];
  profiles: ProfileState[];
  updateSession: (id: string, data: Partial<AssessorEvaluationState>) => void;
}) => {
  const { evaluationId } = useParams();
  const evaluation = evaluations.find((s) => s.id === evaluationId);

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
      onUpdate={(data) => updateSession(evaluation.id, data)}
    />
  );
};

export default App;
