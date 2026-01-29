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
  Module,
  Profile,
  AssessorEvaluation,
  AssessmentSession,
} from "./types";

const ASSESSMENT_LIBRARY_KEY = "assessment_matrix_data";
const ASSESSOR_EVALUATIONS_KEY = "assessment_evaluations";
const ASSESSMENT_SESSIONS_KEY = "assessment_groups";

const App = () => {
  // Master Data State with Persistence
  const [matrix, setMatrix] = useState<Module[]>(() => {
    const saved = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
    return saved ? JSON.parse(saved).matrix : [];
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => {
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
  const [assessments, setAssessments] = useState<AssessmentSession[]>(() => {
    const saved = localStorage.getItem(ASSESSMENT_SESSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(ASSESSMENT_SESSIONS_KEY, JSON.stringify(assessments));
  }, [assessments]);

  // Assessment Evaluations State
  const [evaluations, setEvaluations] = useState<AssessorEvaluation[]>(() => {
    const saved = localStorage.getItem(ASSESSOR_EVALUATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

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
    m: Module[],
    p: Profile[],
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

  const createAssessment = (assessment: AssessmentSession) => {
    setAssessments((prev) => [assessment, ...prev]);
  };

  const createEvaluation = (evaluation: AssessorEvaluation) => {
    setEvaluations((prev) => [evaluation, ...prev]);
  };

  const updateAssessment = (id: string, data: Partial<AssessmentSession>) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a)),
    );
  };

  const updateEvaluation = (id: string, data: Partial<AssessorEvaluation>) => {
    setEvaluations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
    );
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
            />
          }
        />
        <Route
          path="/assessment/:assessmentId/evaluation/:evaluationId"
          element={
            <AssessmentEvaluationRoute
              sessions={evaluations}
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
  onCreateSession,
  onUpdateAssessment,
  onUpdateSession,
  matrix,
  profiles,
  assessorName,
}: {
  assessments: AssessmentSession[];
  evaluations: AssessorEvaluation[];
  onCreateSession: (session: AssessorEvaluation) => void;
  onUpdateAssessment: (id: string, data: Partial<AssessmentSession>) => void;
  onUpdateSession: (id: string, data: Partial<AssessorEvaluation>) => void;
  matrix: Module[];
  profiles: Profile[];
  assessorName: string;
}) => {
  const { assessmentId } = useParams();
  const assessment = assessments.find((a) => a.id === assessmentId);

  // If assessment not found, handle legacy or error?
  // For now, if not found, we might want to check if there are evaluations with this ID as assessmentId (legacy structure support)
  // If we can't find the Group object, but we have evaluations, we might need to "fake" it or redirect.
  // Given the task is about creation, we assume we have it.

  return (
    <AssessmentSessionPage
      assessment={assessment}
      sessions={evaluations}
      onCreateSession={onCreateSession}
      onUpdateAssessment={onUpdateAssessment}
      onUpdateSession={onUpdateSession}
      matrix={matrix}
      profiles={profiles}
      assessorName={assessorName}
    />
  );
};

const AssessmentEvaluationRoute = ({
  sessions,
  matrix,
  profiles,
  updateSession,
}: {
  sessions: AssessorEvaluation[];
  matrix: Module[];
  profiles: Profile[];
  updateSession: (id: string, data: Partial<AssessorEvaluation>) => void;
}) => {
  const { evaluationId } = useParams();
  const session = sessions.find((s) => s.id === evaluationId);

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const profile = profiles.find((p) => p.id === session.profileId);

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const profileModules = matrix.filter((m) => profile.weights[m.id] > 0);

  return (
    <AssessorEvaluationPage
      session={session}
      modules={profileModules}
      profile={profile}
      onUpdate={(data) => updateSession(session.id, data)}
    />
  );
};

export default App;
