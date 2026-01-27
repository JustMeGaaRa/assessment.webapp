import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { Assessment } from "./pages/Assessment";
import { MatrixLibrary } from "./pages/MatrixLibrary";
import { Home } from "./pages/Home";
import type { Module, Profile, AssessmentSession } from "./types";

const STORAGE_KEY = "assessment_matrix_data";
const SESSIONS_KEY = "assessment_sessions";

const App = () => {
  // Master Data State with Persistence
  const [matrix, setMatrix] = useState<Module[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).matrix : [];
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).profiles : [];
  });

  const [stacks, setStacks] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).stacks : {};
  });

  // Persist changes
  useEffect(() => {
    if (matrix.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ matrix, profiles, stacks }),
      );
    }
  }, [matrix, profiles, stacks]);

  // Assessment Sessions State
  const [sessions, setSessions] = useState<AssessmentSession[]>(() => {
    const saved = localStorage.getItem(SESSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Persist sessions
  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const handleDataLoad = (
    m: Module[],
    p: Profile[],
    s: Record<string, string>,
  ) => {
    setMatrix(m);
    setProfiles(p);
    setStacks(s);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ matrix: m, profiles: p, stacks: s }),
    );
  };

  const createSession = (session: AssessmentSession) => {
    setSessions((prev) => [session, ...prev]);
  };

  const updateSession = (id: string, data: Partial<AssessmentSession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              sessions={sessions}
              onCreateSession={createSession}
              onDataLoad={handleDataLoad}
              existingStacks={Object.values(stacks)}
              existingProfiles={profiles}
              hasData={matrix.length > 0}
            />
          }
        />
        <Route
          path="/assessment/:sessionId"
          element={
            <AssessmentRoute
              sessions={sessions}
              matrix={matrix}
              profiles={profiles}
              updateSession={updateSession}
            />
          }
        />
        <Route
          path="/library"
          element={
            <MatrixLibrary
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

const AssessmentRoute = ({
  sessions,
  matrix,
  profiles,
  updateSession,
}: {
  sessions: AssessmentSession[];
  matrix: Module[];
  profiles: Profile[];
  updateSession: (id: string, data: Partial<AssessmentSession>) => void;
}) => {
  const { sessionId } = useParams();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const profile = profiles.find((p) => p.id === session.profileId);

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const profileModules = matrix.filter((m) => profile.weights[m.id] > 0);

  return (
    <Assessment
      session={session}
      modules={profileModules}
      profile={profile}
      onUpdate={(data) => updateSession(session.id, data)}
    />
  );
};

export default App;
