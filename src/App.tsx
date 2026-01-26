import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Assessment } from "./pages/Assessment";
import { MatrixLibrary } from "./pages/MatrixLibrary";
import { Home } from "./pages/Home";
import type { Module, Profile } from "./types";

const STORAGE_KEY = "assessment_matrix_data";

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

  // Assessment Data State (Lifted)
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [candidateName, setCandidateName] = useState("");
  const [activeStack, setActiveStack] = useState("");
  const [activeProfileId, setActiveProfileId] = useState("");

  const resetSession = () => {
    setScores({});
    setNotes({});
  };

  const handleDataLoad = (
    m: Module[],
    p: Profile[],
    s: Record<string, string>,
  ) => {
    setMatrix(m);
    setProfiles(p);
    setStacks(s);
    // Explicit save to ensure immediate persistence before effect if needed,
    // though effect will catch it.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ matrix: m, profiles: p, stacks: s }),
    );
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              setCandidateName={setCandidateName}
              setSelectedStack={setActiveStack}
              setSelectedProfileId={setActiveProfileId}
              onStart={resetSession}
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
            <Assessment
              scores={scores}
              setScores={setScores}
              notes={notes}
              setNotes={setNotes}
              candidateName={candidateName}
              matrix={matrix}
              selectedStack={activeStack}
              selectedProfileTitle={activeProfile?.title || ""}
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

export default App;
